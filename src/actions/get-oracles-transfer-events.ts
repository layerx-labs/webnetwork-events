import db from "src/db";
import logger from "src/utils/logger-handler";
import {Network_v2} from "@taikai/dappkit";
import {EventsProcessed, EventsQuery,} from "src/interfaces/block-chain-service";
import {OraclesTransferEvent} from "@taikai/dappkit/dist/src/interfaces/events/network-v2-events";
import {handleCurators} from "src/modules/handle-curators";
import {DecodedLog} from "../interfaces/block-sniffer";

export const name = "getOraclesTransferEvents";
export const schedule = "*/30 * * * *";
export const description = "Sync transfer oracles data and update council's count";
export const author = "marcusviniciusLsantos";

export async function action(block: DecodedLog<OraclesTransferEvent['returnValues']>, query?: EventsQuery): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};
  const {returnValues: {from: fromAddress, to: toAddress, amount}, connection, address, chainId} = block;

  const dbNetwork = await db.networks.findOne({
    where: {
      networkAddress: address,
      chain_id: chainId
    }
  });

  if (!dbNetwork) {
    logger.warn(`${name} Could not find network ${address}`);
    return eventsProcessed
  }

  const service = new Network_v2(connection, address);
  await service.loadContract();

  const councilAmount = await service.councilAmount();

  const curators =
    await Promise.all(
      [fromAddress, toAddress].map((address) =>
        service.getOraclesResume(address)
        .then(resume => handleCurators(address, resume, councilAmount, dbNetwork.id))));

  eventsProcessed[dbNetwork.name!] = curators.filter(e => e).length === 2 ? [fromAddress, toAddress] : []


  return eventsProcessed;
}
