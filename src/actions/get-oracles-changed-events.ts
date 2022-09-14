import db from "src/db";
import logger from "src/utils/logger-handler";
import {fromSmartContractDecimals, XEvents} from "@taikai/dappkit";
import {EventsProcessed,EventsQuery,} from "src/interfaces/block-chain-service";
import {OraclesChangedEvent} from "@taikai/dappkit/dist/src/interfaces/events/network-v2-events";
import {EventService} from "../services/event-service";

export const name = "getOraclesChangedEvents";
export const schedule = "*/30 * * * *"; // Each 30 minutes
export const description = "Sync oracles data and update council's count";
export const author = "clarkjoao";

export async function action(query?: EventsQuery): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};

  try {

    const service = new EventService(name, query);
    let councilAmount
    let decimals;

    const processor = async (block: XEvents<OraclesChangedEvent>, network) => {
      const {newLockedTotal, actor} = block.returnValues;

      const dbNetwork = await db.networks.findOne({where: {networkAddress: network.networkAddress}});
      if (!dbNetwork)
        return logger.info(`Could not find network ${network.networkAddress}`);

      if (!councilAmount)
        councilAmount = await service.chainService.networkService.network.councilAmount();
      if (!decimals)
        decimals = service.chainService.networkService.network.networkToken.decimals;

      const actorsNewTotal = fromSmartContractDecimals(newLockedTotal, decimals);
      const actorExistsInDb = network.councilMembers.some(address => actor === address);

      if (actorExistsInDb && actorsNewTotal < councilAmount)
        dbNetwork.councilMembers = network.councilMembers.filter(address => address !== actor);
      else if (!actorExistsInDb && actorsNewTotal >= councilAmount)
        dbNetwork.councilMembers = [...network.councilMembers, actor];

      await dbNetwork.save();

      eventsProcessed[network.name] =
        [...eventsProcessed[network.name] as string[], ...dbNetwork.councilMembers || []];
    }

    await service.processEvents(processor);

  } catch (err) {
    logger.error(`Error parsing ${name}`, err);
  }

  return eventsProcessed;
}
