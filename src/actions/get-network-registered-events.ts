import db from "src/db";
import logger from "src/utils/logger-handler";
import {EventsProcessed, EventsQuery,} from "src/interfaces/block-chain-service";
import {EventService} from "../services/event-service";
import {NetworkCreatedEvent} from "@taikai/dappkit/dist/src/interfaces/events/network-factory-v2-events";
import {BlockProcessor} from "../interfaces/block-processor";

export const name = "getNetworkRegisteredEvents";
export const schedule = "*/10 * * * *";
export const description = "retrieving network registered on registry events";
export const author = "vhcsilva";

export async function action(query?: EventsQuery): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};

  const processor: BlockProcessor<NetworkCreatedEvent> = async (block, network) => {
    const {network: createdNetworkAddress} = block.returnValues;

    if (network.isRegistered && network.networkAddress === createdNetworkAddress)
      return logger.warn(`${name} ${createdNetworkAddress} was already registered`);

    const updated =
      !network.isRegistered && network.networkAddress === createdNetworkAddress
        ? await db.networks.update({isRegistered: true}, {where: {networkAddress: network.networkAddress}})
        : [0]


    logger.warn(`${name} ${updated[0] > 0 ? 'Registered' : 'Failed to register'} ${createdNetworkAddress}`)
    eventsProcessed[network.name!] = [network.networkAddress!];
  }

  await (new EventService(name, query, true))._processEvents(processor);

  return eventsProcessed;
}
