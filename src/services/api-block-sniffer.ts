import db from "src/db";
import { MappedEventActions } from "src/interfaces/block-sniffer";
import { BlockSniffer } from "src/services/block-sniffer";
import loggerHandler from "src/utils/logger-handler";

export class ApiBlockSniffer extends BlockSniffer {
  constructor(readonly web3Host: string,
              readonly mappedEventActions: MappedEventActions,
              readonly startBlock: number = 0,
              readonly targetBlock = 0) {
    super(web3Host, mappedEventActions, startBlock, targetBlock);
  }

  protected async saveCurrentBlock(currentBlock = 0) {}

  protected async prepareCurrentBlock() {
    this.currentBlock = Math.max(
      (await db.chain_events.findOne({where: {chain_id: this.actingChainId}, raw: true}))?.lastBlock || 0,
      +(process.env?.BULK_CHAIN_START_BLOCK || 0),
      this.startBlock
    );

    loggerHandler.debug(`ApiBlockSniffer (chain:${this.actingChainId}) currentBlock prepared as ${this.currentBlock}`);
  }
}