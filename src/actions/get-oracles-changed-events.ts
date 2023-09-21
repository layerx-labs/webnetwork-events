import db from "src/db";
import logger from "src/utils/logger-handler";
import {fromSmartContractDecimals, Network_v2,} from "@taikai/dappkit";
import {EventsProcessed, EventsQuery,} from "src/interfaces/block-chain-service";
import {OraclesChangedEvent} from "@taikai/dappkit/dist/src/interfaces/events/network-v2-events";
import BigNumber from "bignumber.js";
import {handleCurators} from "src/modules/handle-curators";
import {updatePriceHeader} from "src/modules/handle-header-information";
import {handleIsDisputed} from "src/modules/handle-isDisputed";
import {DecodedLog} from "../interfaces/block-sniffer";
import {getNetwork} from "../utils/block-process";
import {NETWORK_NOT_FOUND} from "../utils/messages.const";
import {Push} from "../services/analytics/push";
import {AnalyticEventName} from "../services/analytics/types/events";

export const name = "getOraclesChangedEvents";
export const schedule = "*/30 * * * *";
export const description = "Sync oracles data and update council's count";
export const author = "clarkjoao";

export async function action(block: DecodedLog<OraclesChangedEvent['returnValues']>, query?: EventsQuery): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};
  const {returnValues: {newLockedTotal, actionAmount, actor}, connection, address, chainId} = block;

  let councilAmount
  let decimals;

  const network = await getNetwork(chainId, address);
  if (!network) {
    logger.warn(NETWORK_NOT_FOUND(name, address))
    return eventsProcessed;
  }


  const dbNetwork = await db.networks.findOne({
    where: {
      networkAddress: network.networkAddress,
      chain_id: chainId
    }
  });

  if (!dbNetwork) {
    logger.warn(`${name} Could not find network ${network.networkAddress}`);
    return eventsProcessed;
  }

  const service = new Network_v2(connection, network.networkAddress);
  await service.loadContract();


  if (!councilAmount)
    councilAmount = await service.councilAmount();
  if (!decimals)
    decimals = service.networkToken.decimals;

  const actorsNewTotal = BigNumber(fromSmartContractDecimals(newLockedTotal, decimals));
  const networkCouncilMembers = network.councilMembers || [];
  const actorExistsInDb = networkCouncilMembers.some(address => actor === address);
  const actorVotesResume = await service.getOraclesResume(actor)

  await handleCurators(actor, actorVotesResume, councilAmount, dbNetwork.id);

  await handleIsDisputed(name, service, dbNetwork.id)

  if (actorExistsInDb && actorsNewTotal.lt(councilAmount))
    dbNetwork.councilMembers = networkCouncilMembers.filter(address => address !== actor);
  else if (!actorExistsInDb && actorsNewTotal.gte(councilAmount))
    dbNetwork.councilMembers = [...networkCouncilMembers, actor];

  await dbNetwork.save();

  await updatePriceHeader();

  eventsProcessed[network.name!] = dbNetwork.councilMembers || [];

  Push.event(AnalyticEventName.LOCK_UNLOCK_NETWORK, {
    chainId, network: {network: network.name, id: network.id}, actor,
    amount: BigNumber(fromSmartContractDecimals(actionAmount, decimals)), newTotal: actorsNewTotal,
  })


  return eventsProcessed;
}
