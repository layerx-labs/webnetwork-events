import db from "../db/index.js";
import BlockChainService from "../services/block-chain-service.js";
import GHService from "../services/github/index.js";
import logger from "../utils/logger-handler.js";
import { ghPathSplit } from "../utils/string.js";

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

  const [owner, repo] = ghPathSplit(bounty?.repository?.githubPath);

  await GHService.mergeProposal(owner, repo, pullRequest?.githubId);
  await GHService.issueClose(repo, owner, bounty?.issueId);

  return pullRequest;
}

async function closePullRequests(bounty, pullRequest) {
  const pullRequests = await models.pullRequest.findAll({
    where: {
      issueId: bounty.id,
      githubId: { [Op.not]: pullRequest.githubId },
    },
    raw: true,
  });

  const [owner, repo] = ghPathSplit(bounty?.repository?.githubPath);

  for (const pr of pullRequests) {
    await GHService.pullrequestClose(owner, repo, pr.githubId);
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

export async function action() {
  logger.info("retrieving bounty closed events");

  const service = new BlockChainService();
  await service.init(name);

  const events = await service.getAllEvents();

  logger.info(`found ${events.length} events`);

  for (let event of events) {
    const { network, eventsOnBlock } = event;

    try {
      if (!(await service.DAO.loadNetwork(network.networkAddress))) {
        logger.error(`Error loading network contract ${network.name}`);
        continue;
      }

      for (let eventBlock of eventsOnBlock) {
        const { id, proposalId } = eventBlock.returnValues;

        const networkBounty = await service.DAO?.network?.getBounty(id);

        if (!networkBounty) {
          logger.error(`Bounty id: ${id} not found`);
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
              association: "repository",
              association: "merge_proposals",
            },
          ],
        });

        if (!bounty) {
          logger.error(`Bounty cid: ${cid} not found`);
          continue;
        }

        const proposal = bounty?.merge_proposals?.find(
          (p) => p.id === proposalId
        );

        if (networkBounty.closed && !networkBounty.canceled && proposal) {
          const prMerged = await mergeProposal(bounty, proposal);
          if (prMerged) await closePullRequests(bounty, prMerged);
        }

        bounty.merged = proposal.scMergeId;
        bounty.state = "closed";

        await bounty.save();

        await updateUserPayments(bounty, event, networkBounty);

        //TODO: must post a new twitter card;

        logger.info(`Bounty cid: ${cid} closed`);
      }
    } catch (err) {
      logger.error(`Error to close bounty cid: ${cid}`, err);
    }
  }
}

action();
