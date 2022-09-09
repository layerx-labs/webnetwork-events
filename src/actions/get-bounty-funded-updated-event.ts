import db from "src/db";
import {
  BountiesProcessed,
  EventsProcessed,
  EventsQuery,
} from "src/interfaces/block-chain-service";
import BlockChainService from "src/services/block-chain-service";
import logger from "src/utils/logger-handler";

export const name = "getBountyFundedEvents";
export const schedule = "*/10 * * * *"; // Each 10 minutes
export const description = "retrieving bounty created events";
export const author = "MarcusviniciusLsantos";

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

        const fundedAmount: number = networkBounty.funding
          ?.map(({ amount }) => +amount)
          .reduce((accumulator, currentValue) => accumulator + currentValue);

        bounty.fundedAmount = fundedAmount;
        bounty.amount = fundedAmount;

        await bounty.save();

        bountiesProcessed[bounty.issueId as string] = { bounty, eventBlock };

        logger.info(`Bounty cid: ${networkBounty.cid} updated`);
      }

      eventsProcessed[network.name as string] = bountiesProcessed;
    }
  } catch (err) {
    logger.error(`Error update bounty amount:`, err);
  }

  if (!query) {
    await service.saveLastBlock();
  }

  return eventsProcessed;
}
