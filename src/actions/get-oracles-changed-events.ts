import db from "src/db";
import logger from "src/utils/logger-handler";
import {fromSmartContractDecimals, Network_v2,} from "@taikai/dappkit";
import {EventsProcessed,EventsQuery,} from "src/interfaces/block-chain-service";
import {OraclesChangedEvent} from "@taikai/dappkit/dist/src/interfaces/events/network-v2-events";
import {EventService} from "../services/event-service";
import {BlockProcessor} from "../interfaces/block-processor";

export const name = "getOraclesChangedEvents";
export const schedule = "*/30 * * * *";
export const description = "Sync oracles data and update council's count";
export const author = "clarkjoao";

export async function action(query?: EventsQuery): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};

  try {

    const service = new EventService(name, query);
    let councilAmount
    let decimals;

    const processor: BlockProcessor<OraclesChangedEvent> = async (block, network) => {
      const {newLockedTotal, actor} = block.returnValues;

      const dbNetwork = await db.networks.findOne({where: {networkAddress: network.networkAddress}});
      if (!dbNetwork)
        return logger.error(`${name} Could not find network ${network.networkAddress}`);

      if (!councilAmount)
        councilAmount = await (service.Actor as Network_v2).councilAmount();
      if (!decimals)
        decimals = (service.Actor as Network_v2).networkToken.decimals;

      const actorsNewTotal = fromSmartContractDecimals(newLockedTotal, decimals);
      const networkCouncilMembers = network.councilMembers || [];
      const actorExistsInDb = networkCouncilMembers.some(address => actor === address);

      if (actorExistsInDb && actorsNewTotal < councilAmount)
        dbNetwork.councilMembers = networkCouncilMembers.filter(address => address !== actor);
      else if (!actorExistsInDb && actorsNewTotal >= councilAmount)
        dbNetwork.councilMembers = [...networkCouncilMembers, actor];

      await dbNetwork.save();

      eventsProcessed[network.name] = dbNetwork.councilMembers || [];
    }

    await service._processEvents(processor);

  } catch (err) {
    logger.error(`${name} Error`, err);
  }

  return eventsProcessed;
}
