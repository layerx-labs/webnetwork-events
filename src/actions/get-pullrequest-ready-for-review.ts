import db from "src/db";
import {
  BountiesProcessed,
  EventsProcessed,
  EventsQuery,
} from "src/interfaces/block-chain-service";
import BlockChainService from "src/services/block-chain-service";
import logger from "src/utils/logger-handler";

export const name = "getBountyPullRequestReadyForReviewEvents";
export const schedule = "*/30 * * * * *"; // Each 30 minutes
export const description = "Sync pull-request created events";
export const author = "clarkjoao";

const getPRStatus = (prStatus): string =>
  prStatus?.canceled ? "canceled" : prStatus?.ready ? "ready" : "draft";

export default async function action(
  query?: EventsQuery
): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};

  logger.info("retrieving bounty created events");

  const service = new BlockChainService();
  await service.init(name);

  const events = await service.getEvents(query);

  logger.info(`found ${events.length} events`);

  try {
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
        });

        if (!bounty) {
          logger.info(`Bounty cid: ${id} not found`);
          continue;
        }

        const networkPullRequest = networkBounty?.pullRequests[pullRequestId];

        const pullRequest = await db.pull_requests.findOne({
          where: {
            issueId: bounty?.id,
            githubId: networkPullRequest.cid.toString(),
            status: "draft",
          },
        });

        if (!pullRequest) {
          logger.info(`Pull request cid: ${networkPullRequest.cid} not found`);
          continue;
        }

        pullRequest.status = getPRStatus(networkPullRequest);
        pullRequest.userRepo = networkPullRequest.userRepo;
        pullRequest.userBranch = networkPullRequest.userBranch;
        pullRequest.contractId = +networkPullRequest.id;

        await pullRequest.save();

        if (bounty.state !== "ready") {
          bounty.state = "ready";

          await bounty.save();
        }

        bountiesProcessed[bounty.issueId as string] = { bounty, eventBlock };

        logger.info(`Bounty cid: ${id} created`);
      }

      eventsProcessed[network?.name as string] = bountiesProcessed;
    }
    if (!query) await service.saveLastBlock();
  } catch (err) {
    logger.error(`Error ${name}:`, err);
  }
  return eventsProcessed;
}
