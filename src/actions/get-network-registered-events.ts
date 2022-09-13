import db from "src/db";

import {
  EventsProcessed,
  EventsQuery,
} from "src/interfaces/block-chain-service";

import BlockChainService from "src/services/block-chain-service";

import logger from "src/utils/logger-handler";
import {EventService} from "../services/event-service";
import {XEvents} from "@taikai/dappkit";
import {NetworkCreatedEvent} from "@taikai/dappkit/dist/src/interfaces/events/network-factory-v2-events";

export const name = "getNetworkCreatedEvents";
export const schedule = "*/30 * * * *"; // Each 30 minutes
export const description = "retrieving network registered on registry events";
export const author = "vhcsilva";

export async function action(query?: EventsQuery): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};

  try {

    const processor = async (block: XEvents<NetworkCreatedEvent>, network) => {
      const {network: createdNetworkAddress} = block.returnValues;

      const updated =
        !network.isRegistered && network.networkAddress === createdNetworkAddress
          ? await db.networks.update({isRegistered: true}, {where: {networkAddress: network.networkAddress}})
          : [0]


      logger.info(`${updated[0] > 0 ? 'Registered' : 'Failed to register'} ${createdNetworkAddress}`)
      eventsProcessed[network.name!] = [network.networkAddress!];
    }

    await (new EventService(name, query, true)).processEvents(processor);

  } catch (err) {
    logger.error(`Error registering network`, err);
  }

  return eventsProcessed;
}
