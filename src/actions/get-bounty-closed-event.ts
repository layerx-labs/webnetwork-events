import { Op } from "sequelize";
import db from "src/db";
import {
  BountiesProcessed,
  EventsQuery,
} from "src/interfaces/block-chain-service.js";
import BlockChainService from "src/services/block-chain-service";
import GHService from "src/services/github";
import logger from "src/utils/logger-handler";
import { slashSplit } from "src/utils/string";

export const name = "getBountyClosedEvents";
export const schedule = "1 * * * * *";
export const description = "retrieving bounty closed events";
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

  await GHService.mergeProposal(owner, repo, pullRequest?.githubId as string);
  await GHService.issueClose(repo, owner, bounty?.issueId);

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
): Promise<BountiesProcessed[]> {
  const bountiesProcessed: BountiesProcessed[] = [];

  logger.info("retrieving bounty closed events");

  const service = new BlockChainService();
  await service.init(name);

  const events = await service.getEvents(query);

  logger.info(`found ${events.length} events`);

  try {
    for (let event of events) {
      const { network, eventsOnBlock } = event;

      if (!(await service.DAO.loadNetwork(network.networkAddress))) {
        logger.error(`Error loading network contract ${network.name}`);
        continue;
      }

      for (let eventBlock of eventsOnBlock) {
        const { id, proposalId } = eventBlock.returnValues;

        const networkBounty = await service.DAO?.network?.getBounty(id);

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
          (p) => p.id === proposalId
        );

        if (networkBounty.closed && !networkBounty.canceled && proposal) {
          const prMerged = await mergeProposal(bounty, proposal);
          if (prMerged) await closePullRequests(bounty, prMerged);
        }

        bounty.merged = proposal?.scMergeId;
        bounty.state = "closed";

        await bounty.save();

        await updateUserPayments(bounty, event, networkBounty);
        bountiesProcessed.push({
          bounty,
          networkBounty,
        });

        //TODO: must post a new twitter card;

        logger.info(`Bounty id: ${id} closed`);
      }
    }
  } catch (err) {
    logger.error(`Error to close bounty:`, err);
  }
  if (query) service.saveLastBlock();

  return bountiesProcessed;
}
