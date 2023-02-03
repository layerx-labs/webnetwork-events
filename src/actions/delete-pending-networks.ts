import db from "src/db";
import logger from "src/utils/logger-handler";
import { EventsProcessed, EventsQuery } from "src/interfaces/block-chain-service";

export const name = "deletePendingNetworks";
export const schedule = "0 0 * * *";
export const description = "delete networks pending for 7 days or more";
export const author = "vhcsilva";

const DAY = 1000 * 60 * 60 * 24;

const {
  EVENTS_CHAIN_ID: chainId
} = process.env;

export async function action(query?: EventsQuery): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};

  logger.info(`${name} start`);

  try {
    const pendingNetworks =
      await db.networks.findAll({
        where: {
          isRegistered: false,
          isClosed: false,
          chain_id: chainId
        }
      });

    for (const network of pendingNetworks) {
      const createdAt = new Date(network.createdAt!).getTime();
      const now = new Date().getTime();

      if ((now - createdAt) / DAY >= 7 ) {
        await db.repositories.destroy({where: {network_id: network.id}});

        await db.networks.destroy({where: {networkAddress: network.networkAddress}});

        eventsProcessed[network.name!] = [network.networkAddress!];

        logger.info(`${name} Network ${network.networkAddress} and it's repositories were deleted`);
      }
    }
  } catch (err: any) {
    logger.error(`${name} Error`, err?.message || err.toString());
  }

  return eventsProcessed;
}