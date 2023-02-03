import db from "src/db";
import logger from "src/utils/logger-handler";
import {EventsProcessed, EventsQuery,} from "src/interfaces/block-chain-service";
import {EventService} from "../services/event-service";
import {NetworkCreatedEvent} from "@taikai/dappkit/dist/src/interfaces/events/network-factory-v2-events";
import {BlockProcessor} from "../interfaces/block-processor";
import { updateNumberOfNetworkHeader } from "src/modules/handle-header-information";
import DAO from "src/services/dao-service";
import { findOrCreateToken } from "src/modules/tokens";

export const name = "getNetworkRegisteredEvents";
export const schedule = "*/10 * * * *";
export const description = "retrieving network registered on registry events";
export const author = "vhcsilva";

export async function action(query?: EventsQuery): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};

  const processor: BlockProcessor<NetworkCreatedEvent> = async (block, _network, chainId) => {
    const {network: createdNetworkAddress} = block.returnValues;

    const network = await db.networks.findOne({ where: { networkAddress: createdNetworkAddress, chain_id: _network.chainId } });

    if (!network)
      return logger.warn(`${name} network with address ${createdNetworkAddress} not found on db`);

    if (network.isRegistered)
      return logger.warn(`${name} ${createdNetworkAddress} was already registered`);

    const dao = new DAO({ networkAddress: createdNetworkAddress });

    await dao.start();

    if (dao.network?.networkToken?.contractAddress) {
      const address = dao.network.networkToken.contractAddress!;
      const name = await dao.network.networkToken.name();
      const symbol = await dao.network.networkToken.symbol();

      const networkToken = await findOrCreateToken(address, name, symbol);

      if (networkToken)
        network.network_token_id = networkToken.id;
    }

    network.isRegistered = true;

    await network.save();

    await updateNumberOfNetworkHeader();
    
    logger.warn(`${name} Registered ${createdNetworkAddress}`);
    eventsProcessed[network.name!] = [network.networkAddress!];
  }

  await (new EventService(name, query, true, undefined, false))._processEvents(processor);

  return eventsProcessed;
}
