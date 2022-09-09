import db from "src/db";
import {
  BountiesProcessed,
  EventsProcessed,
  EventsQuery,
} from "src/interfaces/block-chain-service";
import BlockChainService from "src/services/block-chain-service";
import logger from "src/utils/logger-handler";

import { Bounty, PullRequest } from "src/interfaces/bounties";
import GHService from "src/services/github";
import { slashSplit } from "src/utils/string";

export const name = "getBountyPullRequestCanceledEvents";
export const schedule = "*/10 * * * *"; // Each 10 minutes
export const description = "Sync pull-request canceled events";
export const author = "clarkjoao";

async function closePullRequest(bounty: Bounty, pullRequest: PullRequest) {
  const [owner, repo] = slashSplit(bounty?.repository?.githubPath as string);
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

export default async function action(
  query?: EventsQuery
): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};

  try {
    logger.info("retrieving bounty created events");

    const service = new BlockChainService();
    await service.init(name);

    const events = await service.getEvents(query);

    logger.info(`found ${events.length} events`);
    for (let event of events) {
      const { network, eventsOnBlock } = event;

      const bountiesProcessed: BountiesProcessed = {};

      if (!(await service.networkService.loadNetwork(network.networkAddress))) {
        logger.error(`Error loading network contract ${network.name}`);
        continue;
      }

      for (let eventBlock of eventsOnBlock) {
        const { bountyId: id, pullRequestId } = eventBlock.returnValues;
        const networkBounty = await service.networkService?.network?.getBounty(
          id
        );

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

        bountiesProcessed[bounty.issueId as string] = { bounty, eventBlock };

        logger.info(`Pull Request ${id} canceled`);
      }
      eventsProcessed[network.name as string] = bountiesProcessed;
    }
    if (!query) await service.saveLastBlock();
  } catch (err) {
    logger.error(`Error ${name}:`, err);
  }
  return eventsProcessed;
}
