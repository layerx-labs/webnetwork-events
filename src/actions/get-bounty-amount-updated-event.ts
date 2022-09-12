import db from "src/db";
import {
  BountiesProcessed,
  EventsProcessed,
  EventsQuery,
} from "src/interfaces/block-chain-service";
import BlockChainService from "src/services/block-chain-service";
import logger from "src/utils/logger-handler";
import {EventService} from "../services/event-service";
import {XEvents} from "@taikai/dappkit";
import {BountyAmountUpdatedEvent} from "@taikai/dappkit/dist/src/interfaces/events/network-v2-events";

export const name = "getBountyAmountUpdatedEvents";
export const schedule = "*/10 * * * *"; // Each 10 minutes
export const description = "retrieving bounty updated events";
export const author = "clarkjoao";

export async function action(
  query?: EventsQuery
): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};

  try {
    const service = new EventService(name, new BlockChainService(), query);
    let _network;

    const processor = async (block: XEvents<BountyAmountUpdatedEvent>) => {
      const {id} = block.returnValues;

      if (!_network || _network.contractId !== service.chainService.networkService.network.contractAddress)
        _network = await db.networks.findOne({
          where: {networkAddress: service.chainService.networkService.network.contractAddress}});

      const bounty = await service.chainService.networkService.network.getBounty(id);
      if (!bounty)
        logger.info(`Bounty not found for id ${id} in network ${service.chainService.networkService.network.contractAddress}`)
      else {
        const dbBounty = await db.issues.findOne({
          where: {contractId: id, issueId: bounty.cid, network_id: _network.network_id}});

        if (!dbBounty)
          logger.info(`Failed to find a bounty on database matching ${bounty.cid} on network ${_network.network_id}`)
        else {
          dbBounty.amount = +bounty.tokenAmount;
          await dbBounty.save();

          eventsProcessed[_network.name] = {[dbBounty.issueId!.toString()]: {bounty: dbBounty, eventBlock: block}};
        }
      }
    }

    await service.processEvents(processor);

  } catch (e) {
    logger.error(`Failed to parse ${name}`, e);
  }

  return eventsProcessed;
}
