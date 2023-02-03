import db from "src/db";
import logger from "src/utils/logger-handler";
import {EventsProcessed, EventsQuery,} from "src/interfaces/block-chain-service";
import {EventService} from "../services/event-service";
import {NetworkCreatedEvent} from "@taikai/dappkit/dist/src/interfaces/events/network-factory-v2-events";
import {BlockProcessor} from "../interfaces/block-processor";
import {updateNumberOfNetworkHeader} from "src/modules/handle-header-information";

export const name = "getNetworkRegisteredEvents";
export const schedule = "*/10 * * * *";
export const description = "retrieving network registered on registry events";
export const author = "vhcsilva";

export async function action(query?: EventsQuery): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};

  const processor: BlockProcessor<NetworkCreatedEvent> = async (block, _network, chainId) => {
    const {network: createdNetworkAddress} = block.returnValues;

    const network = await db.networks.findOne({ where: { networkAddress: createdNetworkAddress, chain_id: chainId } });

    if (!network)
      return logger.warn(`${name} network with address ${createdNetworkAddress} not found on db`);

    if (network.isRegistered && network.networkAddress === createdNetworkAddress)
      return logger.warn(`${name} ${createdNetworkAddress} was already registered`);

    const updated =
      !network.isRegistered && network.networkAddress === createdNetworkAddress
        ? await db.networks.update({isRegistered: true}, {where: {networkAddress: network.networkAddress}})
        : [0]

    await updateNumberOfNetworkHeader()

    logger.info(`${name} ${updated[0] > 0 ? 'Registered' : 'Failed to register'} ${createdNetworkAddress}`)
    eventsProcessed[network.name!] = [network.networkAddress!];
  }

  await (new EventService(name, query, true, undefined, false))._processEvents(processor);

  return eventsProcessed;
}
