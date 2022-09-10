import {XEvents} from "@taikai/dappkit";


export type BlockProcessor<T = any, R = any> = (block: XEvents<T>) => Promise<R>