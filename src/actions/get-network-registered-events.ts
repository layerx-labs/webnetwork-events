import db from "src/db";

import {
  EventsProcessed,
  EventsQuery,
} from "src/interfaces/block-chain-service";

import BlockChainService from "src/services/block-chain-service";

import logger from "src/utils/logger-handler";

export const name = "getNetworkCreatedEvents";
export const schedule = "*/30 * * * *"; // Each 30 minutes
export const description = "retrieving network registered on registry events";
export const author = "vhcsilva";

export default async function action(
  query?: EventsQuery
): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};

  try {
    logger.info("Retrieving network registered events");

    const service = new BlockChainService();
    await service.init(name);

    const events = await service.getEvents(query, true);

    const totalEvents = events.reduce(
      (acc, event) => acc + event.eventsOnBlock.length,
      0
    );

    logger.info(`Found ${totalEvents} events`);
    for (let event of events) {
      const { network, eventsOnBlock } = event;

      const wasRegistered = !!eventsOnBlock.find(
        (e) => e.returnValues.network === network.networkAddress
      );

      if (!network.isRegistered && wasRegistered) {
        await db.networks.update(
          {
            isRegistered: true,
          },
          {
            where: {
              networkAddress: network.networkAddress,
            },
          }
        );

        eventsProcessed[network.name!] = [network.networkAddress!];

        logger.info(`Network ${network.networkAddress} registered`);
      }
    }
    if (!query) await service.saveLastBlock();
  } catch (err) {
    logger.error(`Error registering network`, err);
  }

  return eventsProcessed;
}
