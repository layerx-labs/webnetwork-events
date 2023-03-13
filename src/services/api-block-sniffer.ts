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
}