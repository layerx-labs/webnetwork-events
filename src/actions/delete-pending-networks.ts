import db from "src/db";

import { EventsProcessed, EventsQuery } from "src/interfaces/block-chain-service";

import logger from "src/utils/logger-handler";

export const name = "deletePendingNetworks";
export const schedule = "0 0 * * *"; // At 00:00, every day
export const description = "delete networks pending for 7 days or more";
export const author = "vhcsilva";

const DAY = 1000 * 60 * 60 * 24;

export async function action(query?: EventsQuery): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};

  logger.info("Deleting networks pending for 7 days or more");

  try {
    const pendingNetworks = await db.networks.findAll({
      where: {
        isRegistered: false,
        isClosed: false
      }
    });

    for (let network of pendingNetworks) {
      const createdAt = new Date(network.createdAt!).getTime();
      const now = new Date().getTime();

      if ((now - createdAt) / DAY >= 7 ) {
        await db.repositories.destroy({
          where: {
            network_id: network.id
          }
        });

        await db.networks.destroy({
          where: {
            networkAddress: network.networkAddress
          }
        });

        eventsProcessed[network.name!] = [network.networkAddress!];

        logger.info(`Network ${network.networkAddress} and it's repositories was deleted`);
      }
    }
  } catch (err) {
    logger.error(`Error registering network`, err);
  }

  return eventsProcessed;
}