import db from "../db/index.js";
import { fromSmartContractDecimals } from "@taikai/dappkit";
import BlockChainService from "../services/block-chain-service.js";
import logger from "../utils/logger-handler.js";

export const name = "getOraclesChangedEvents";
export const schedule = "1 * * * * *";
export const description = "update oracles ammount";
export const author = "clarkjoao";

export async function action() {
  logger.info("retrieving oracles changed events");

  const service = new BlockChainService();
  await service.init(name);

  const events = await service.getAllEvents();

  logger.info(`found ${events.length} ${name} events`);

  for (let event of events) {
    const { network, eventsOnBlock } = event;

    const _network = await db.networks.findOne({
      where: {
        networkAddress: network.networkAddress,
      },
    });

    if (!_network) {
      logger.error(`Network ${event.network.networkAddress} not found`);
      continue;
    }

    try {
      const councilAmount = await service?.DAO?.network?.councilAmount();
      const existing_members = [...(_network?.councilMembers || [])];
      const remove_members = [];

      for (let eventBlock of eventsOnBlock) {
        const { newLockedTotal, actor } = eventBlock.returnValues;

        const newTotal = fromSmartContractDecimals(newLockedTotal);

        if (newTotal >= councilAmount && !existing_members.includes(actor))
          existing_members.push(actor);
        else if (newTotal < councilAmount && existing_members.includes(actor))
          remove_members.push(actor);
      }

      const new_members = existing_members.filter(
        (address) => !remove_members.includes(address)
      );

      _network.councilMembers = new_members;
      await _network.save();

      await service.saveLastBlock();
    } catch (err) {
      logger.error(`Error ${name}: ${err.message}`);
    }
  }
}
