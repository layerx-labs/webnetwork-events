import {Log} from "web3-core";
import {EventsQuery} from "./block-chain-service";
import {Web3Connection} from "@taikai/dappkit";

export interface SnifferContext {
  connection: Web3Connection;
  chainId: number;
}

export interface ParsedLog<T = any> {
  eventName: string;
  returnValues: T;
}

export type DecodedLog<T = any> = (Log & ParsedLog<T> & SnifferContext);

export interface MappedEventActions {
  [contractAddress: string]: { //
    abi: { type: any; name: string; inputs: any[] }[]; // ContractABI
    events: {
      [eventName: string]: (log: DecodedLog, query: EventsQuery | null) => void;
    }
  };
}

export interface AddressEventDecodedLog {
  [address: string]: { [eventName: string]: DecodedLog[] }
}