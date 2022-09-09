import db from "src/db";
import {
  BountiesProcessed,
  EventsProcessed,
  EventsQuery,
} from "src/interfaces/block-chain-service";
import BlockChainService from "src/services/block-chain-service";
import logger from "src/utils/logger-handler";

export const name = "getBountyAmountUpdatedEvents";
export const schedule = "*/10 * * * *"; // Each 10 minutes
export const description = "retrieving bounty updated events";
export const author = "clarkjoao";

export default async function action(
  query?: EventsQuery
): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};

  try {
    logger.info("retrieving bounty updated events");

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
        const { id } = eventBlock.returnValues;

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
        });

        if (!bounty) {
          logger.info(`Bounty cid: ${networkBounty.cid} not found`);
          continue;
        }

        bounty.amount = +networkBounty.tokenAmount;
        await bounty.save();

        bountiesProcessed[bounty.issueId as string] = { bounty, eventBlock };

        logger.info(`Bounty cid: ${networkBounty.cid} updated`);
      }
      eventsProcessed[network.name as string] = bountiesProcessed;
    }

    if (!query) await service.saveLastBlock();
  } catch (err) {
    logger.error(`Error update bounty amount:`, err);
  }

  return eventsProcessed;
}
