import {MappedEventActions} from "src/interfaces/block-sniffer";
import {BlockSniffer} from "src/services/block-sniffer";

export class ApiBlockSniffer extends BlockSniffer {
  constructor(readonly web3Host: string,
              readonly mappedEventActions: MappedEventActions,
              readonly startBlock: number = 0,
              readonly targetBlock: number = 0) {
    super(web3Host, mappedEventActions, startBlock, startBlock + 1, null, 0);
  }

  // remove these because they are not needed on this ephemeral state
  protected async saveCurrentBlock(currentBlock = 0) {
  }

  protected async prepareCurrentBlock() {
    this.currentBlock = this.startBlock;
  }
}