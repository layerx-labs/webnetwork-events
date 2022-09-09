import { Op } from "sequelize";
import db from "src/db";
import {
  BountiesProcessed,
  EventsProcessed,
  EventsQuery,
} from "src/interfaces/block-chain-service.js";
import BlockChainService from "src/services/block-chain-service";
import GHService from "src/services/github";
import logger from "src/utils/logger-handler";
import { slashSplit } from "src/utils/string";

export const name = "getBountyClosedEvents";
export const schedule = "*/30 * * * *"; // Each 30 minuts
export const description = "Move to 'Closed' status the bounty";
export const author = "clarkjoao";

async function mergeProposal(bounty, proposal) {
  const pullRequest = await db.pull_requests.findOne({
    where: {
      id: proposal.pullRequestId,
      issueId: proposal.issueId,
    },
  });

  if (!pullRequest) return;

  const [owner, repo] = slashSplit(bounty?.repository?.githubPath);

  await GHService.mergeProposal(repo, owner, pullRequest?.githubId as string);
  await GHService.issueClose(repo, owner, bounty?.githubId);

  return pullRequest;
}

async function closePullRequests(bounty, pullRequest) {
  const pullRequests = await db.pull_requests.findAll({
    where: {
      issueId: bounty.id,
      githubId: { [Op.not]: pullRequest.githubId },
    },
    raw: true,
  });

  const [owner, repo] = slashSplit(bounty?.repository?.githubPath);

  for (const pr of pullRequests) {
    await GHService.pullrequestClose(owner, repo, pr.githubId as string);
  }
}

async function updateUserPayments(bounty, event, networkBounty) {
  return await Promise.all(
    networkBounty?.proposals?.[0].details.map(async (detail) =>
      db.users_payments.create({
        address: detail?.["recipient"],
        ammount:
          Number((detail?.["percentage"] / 100) * networkBounty?.tokenAmount) ||
          0,
        issueId: bounty?.id,
        transactionHash: event?.transactionHash || null,
      })
    )
  );
}

export default async function action(
  query?: EventsQuery
): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};

  try {
    logger.info("retrieving bounty closed events");

    const service = new BlockChainService();
    await service.init(name);

    const events = await service.getEvents(query);

    logger.info(`found ${events.length} events`);

    for (let event of events) {
      const { network, eventsOnBlock } = event;

      if (!(await service.networkService.loadNetwork(network.networkAddress))) {
        logger.error(`Error loading network contract ${network.name}`);
        continue;
      }
      const bountiesProcessed: BountiesProcessed = {};

      for (let eventBlock of eventsOnBlock) {
        const { id, proposalId } = eventBlock.returnValues;

        const networkBounty = await service.networkService?.network?.getBounty(
          id
        );

        if (!networkBounty) {
          logger.info(`Bounty id: ${id} not found`);
          continue;
        }

        const bounty = await db.issues.findOne({
          where: {
            contractId: id,
            issueId: networkBounty?.cid,
            network_id: network?.id,
          },
          include: [
            {
              association: "token",
            },
            {
              association: "repository",
            },
            {
              association: "merge_proposals",
            },
          ],
        });

        if (!bounty) {
          logger.info(`Bounty cid: ${id} not found`);
          continue;
        }

        const proposal = bounty?.merge_proposals?.find(
          (p) => p.contractId?.toString() === proposalId?.toString()
        );

        if (networkBounty.closed && !networkBounty.canceled && proposal) {
          const prMerged = await mergeProposal(bounty, proposal);
          if (prMerged) await closePullRequests(bounty, prMerged);
        }

        bounty.merged = proposal?.scMergeId;
        bounty.state = "closed";

        await bounty.save();

        await updateUserPayments(bounty, event, networkBounty);

        bountiesProcessed[bounty.issueId as string] = { bounty, eventBlock };

        logger.info(`Bounty id: ${id} closed`);
      }
      eventsProcessed[network.name as string] = bountiesProcessed;
    }
    if (!query) service.saveLastBlock();
  } catch (err) {
    logger.error(`Error to close bounty:`, err);
  }

  return eventsProcessed;
}
