import db from "src/db";
import { EventsQuery } from "src/interfaces/block-chain-service";
import BlockChainService from "src/services/block-chain-service";
import logger from "src/utils/logger-handler";
import { BountiesProcessed } from "./../interfaces/block-chain-service";

import { Bounty, PullRequest } from "src/interfaces/bounties";
import GHService from "src/services/github";
import { ghPathSplit } from "src/utils/string";

export const name = "getBountyPullRequestCanceledEvents";
export const schedule = "1 * * * * *";
export const description = "Get bounty pull request created events";
export const author = "clarkjoao";

async function closePullRequest(bounty: Bounty, pullRequest: PullRequest) {
  const [owner, repo] = ghPathSplit(bounty?.repository?.githubPath as string);
  await GHService.pullrequestClose(
    repo,
    owner,
    pullRequest?.githubId as string
  );

  const body = `This pull request was closed by @${pullRequest?.githubLogin}`;
  await GHService.createCommentOnIssue(
    repo,
    owner,
    bounty?.githubId as string,
    body
  );
}

export async function getPullRequestCanceled(
  query?: EventsQuery
): Promise<BountiesProcessed[]> {
  const bountiesProcessed: BountiesProcessed[] = [];
  logger.info("retrieving bounty created events");

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
        const { bountyId: id, pullRequestId } = eventBlock.returnValues;
        const networkBounty = await service.DAO?.network?.getBounty(id);

        if (!networkBounty) {
          logger.info(`Bounty id: ${id} not found`);
          continue;
        }

        const bounty = await db.issues.findOne({
          where: {
            issueId: networkBounty.cid,
            contractId: id,
            network_id: network?.id,
          },
          include: [{ association: "repository" }],
        });

        if (!bounty) {
          logger.info(`Bounty cid: ${id} not found`);
          continue;
        }

        const networkPullRequest = networkBounty?.pullRequests[pullRequestId];

        const pullRequest = await db.pull_requests.findOne({
          where: {
            issueId: bounty?.id,
            githubId: networkPullRequest?.cid?.toString(),
            contractId: network?.id,
          },
        });

        if (!pullRequest) {
          logger.info(`Pull request cid: ${networkPullRequest.cid} not found`);
          continue;
        }

        await closePullRequest(bounty, pullRequest).catch(logger.error);

        pullRequest.status = "canceled";

        await pullRequest.save();

        if (
          !networkBounty.pullRequests.find((pr) => pr.ready && !pr.canceled)
        ) {
          bounty.state = "open";

          await bounty.save();
        }

        bountiesProcessed.push({ bounty, networkBounty });

        logger.info(`Pull Request ${id} Created`);
      }
    }
    if (!query) await service.saveLastBlock();
  } catch (err) {
    logger.error(`Error ${name}:`, err);
  }
  return bountiesProcessed;
}

export const action = getPullRequestCanceled;

export default action;
