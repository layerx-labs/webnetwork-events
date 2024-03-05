import db from "src/db";
import logger from "src/utils/logger-handler";
import {fromSmartContractDecimals, Network_v2} from "@taikai/dappkit";
import {EventsProcessed, EventsQuery,} from "src/interfaces/block-chain-service";
import {OraclesTransferEvent} from "@taikai/dappkit/dist/src/interfaces/events/network-v2-events";
import {handleCurators} from "src/modules/handle-curators";
import {DecodedLog} from "../interfaces/block-sniffer";
import {Push} from "../services/analytics/push";
import {AnalyticEventName} from "../services/analytics/types/events";

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
  await service.start();

  const councilAmount = await service.councilAmount();

  let curators: string[] = []

  for (const address of [fromAddress, toAddress]){
    const resume = await service.getOraclesResume(address);

    if(!resume)
      logger.warn(`${name} Could not find getOraclesResume ${address} - ${dbNetwork.networkAddress} - ${connection}`);

    const curator = await handleCurators(address, resume, councilAmount, dbNetwork.id)

    if(curator)
      curators.push(curator?.address)  
  }

  eventsProcessed[dbNetwork.name!] = curators

  Push.event(AnalyticEventName.DELEGATE_UNDELEGATE, {
    chainId, network: {network: dbNetwork.name, id: dbNetwork.id}, currency: await service.networkToken.symbol(),
    amount: fromSmartContractDecimals(amount, service.networkToken.decimals), fromAddress, toAddress,
  })

  return eventsProcessed;
}
