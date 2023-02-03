import {XEvents} from "@taikai/dappkit";

interface Block {
  transactionHash: string;
  returnValues: {[p: string]: string, __length__: number}
}

export type BlockProcessor<T = any,> = (block: Block & T, network: Partial<NetworkProps>, chainId: string) => void