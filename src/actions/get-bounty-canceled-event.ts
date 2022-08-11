import db from "src/db";
import {
  BountiesProcessed,
  BountiesProcessedPerNetwork,
  EventsQuery,
} from "src/interfaces/block-chain-service";
import BlockChainService from "src/services/block-chain-service";
import GHService from "src/services/github";
import logger from "src/utils/logger-handler";
import { slashSplit } from "src/utils/string";

export const name = "getBountyCanceledEvents";
export const schedule = "1 * * * * *";
export const description = "retrieving bounty canceled events";
export const author = "clarkjoao";

export default async function action(
  query?: EventsQuery
): Promise<BountiesProcessedPerNetwork[]> {
  const bountiesProcessedPerNetwork: BountiesProcessedPerNetwork[] = [];

  logger.info("retrieving bounty canceled events");

  const service = new BlockChainService();
  await service.init(name);

  const events = await service.getEvents(query);

  logger.info(`found ${events.length} events`);

  try {
    for (let event of events) {
      const { network, eventsOnBlock } = event;

      const bountiesProcessed: BountiesProcessed[] = [];

      if (!(await service.networkService.loadNetwork(network.networkAddress))) {
        logger.error(`Error loading network contract ${network.name}`);
        continue;
      }

      for (let eventBlock of eventsOnBlock) {
        const { id } = eventBlock.returnValues;

        const networkBounty = await service.networkService?.network?.getBounty(
          +id
        );

        if (!networkBounty) {
          logger.info(`Bounty id: ${id} not found`);
          continue;
        }

        const bounty = await db.issues.findOne({
          where: {
            contractId: id,
            issueId: networkBounty.cid,
            network_id: network.id,
          },
          include: [{ association: "token" }, { association: "repository" }],
        });

        if (!bounty || !bounty.githubId) {
          logger.info(`Bounty cid: ${networkBounty.cid} not found`);
          continue;
        }

        if (bounty.state !== "draft") {
          logger.info(
            `Bounty cid: ${networkBounty.cid} already in draft state`
          );
          continue;
        }

        const [owner, repo] = slashSplit(bounty?.repository?.githubPath);

        const isClosed = await GHService.issueClose(
          repo,
          owner,
          bounty.githubId
        ).catch(console.error);

        if (isClosed) {
          bounty.state = "canceled";

          await bounty.save();

          bountiesProcessed.push({ bounty, eventBlock });

          logger.info(`Bounty cid: ${networkBounty.cid} canceled`);
        }
      }
      bountiesProcessedPerNetwork.push({ network, bountiesProcessed });
    }
    if (!query) await service.saveLastBlock();
  } catch (err) {
    logger.error(`Error ${name}: `, err);
  }

  return bountiesProcessedPerNetwork;
}
