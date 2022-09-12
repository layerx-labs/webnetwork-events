import {XEvents} from "@taikai/dappkit";


export type BlockProcessor<T = any,> = (block: XEvents<T>) => void