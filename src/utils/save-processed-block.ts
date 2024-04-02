import db from "../db";
import loggerHandler from "./logger-handler";

export const saveProcessedBlock = (lastBlock: number, event: string, chain_id: number, contract_address: string) =>
  db.chain_events.findOrCreate({
      where: { name: event, chain_id, contract_address, },
      defaults: { name: event, lastBlock, chain_id, contract_address }
    })
    .then(([event, created]) => {
      if (!created) {
        event.lastBlock = lastBlock
        event.save();
      }

      loggerHandler.debug(`Processed chain:${chain_id} event:${event} blockNumber:${lastBlock}`)
    })
