import db from "src/db";
import logger from "src/utils/logger-handler";
import {Network_v2} from "@taikai/dappkit";
import {EventsProcessed,EventsQuery,} from "src/interfaces/block-chain-service";
import {OraclesChangedEvent} from "@taikai/dappkit/dist/src/interfaces/events/network-v2-events";
import {EventService} from "../services/event-service";
import {BlockProcessor} from "../interfaces/block-processor";
import BigNumber from "bignumber.js";
import { handleCurators } from "src/modules/handle-curators";

export const name = "getOraclesTransferEvents";
export const schedule = "*/30 * * * *";
export const description = "Sync transfer oracles data and update council's count";
export const author = "marcusviniciusLsantos";


async function handleTransfers(addresses: string[], councilAmount: string, networkId: number, service) {
 return Promise.all(addresses.map(async address => {
      const actorTotalVotes = BigNumber(await (service.Actor as Network_v2).getOraclesOf(address));

      return await handleCurators(address, actorTotalVotes, councilAmount, networkId)
  }))
}

export async function action(query?: EventsQuery): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};
  const service = new EventService(name, query);

  let councilAmount: string

  const processor: BlockProcessor<OraclesChangedEvent> = async (block, network) => {
    const {from: fromAddress, to: toAddress, amount} = block.returnValues;

    const dbNetwork = await db.networks.findOne({where: {networkAddress: network.networkAddress}});
    if (!dbNetwork)
      return logger.error(`${name} Could not find network ${network.networkAddress}`);

    if (!councilAmount)
      councilAmount = await (service.Actor as Network_v2).councilAmount();

    const curators = await handleTransfers([fromAddress, toAddress], councilAmount, dbNetwork.id, service)

    eventsProcessed[network.name] = curators.filter(e => e).length === 2 ? [fromAddress, toAddress] : []
  }

  await service._processEvents(processor);

  return eventsProcessed;
}
