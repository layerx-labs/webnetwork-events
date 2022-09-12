import {XEvents} from "@taikai/dappkit";
import {networksAttributes as NetworkProps} from "../db/models/networks";


export type BlockProcessor<T = any,> =
  (block: XEvents<T>, network: Partial<NetworkProps>) => void