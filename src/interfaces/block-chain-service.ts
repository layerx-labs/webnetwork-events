import { networksAttributes as NetworkProps } from "src/db/models/networks";

export type BlockQuery = {
  from?: number;
  to: number;
};

export interface EventsPerNetwork {
  network: Partial<NetworkProps>;
  eventsOnBlock: any[];
}

export interface EventsQuery {
  networkName: string;
  blockQuery: BlockQuery;
}

export interface BountiesProcessed {
  bounty: {};
  eventBlock: {} | null;
}
export interface BountiesProcessedPerNetwork {
  network: Partial<NetworkProps>;
  bountiesProcessed?: BountiesProcessed[];
  addressProcessed?: string[];
}

export interface EventsProcessed {
  events: BountiesProcessed[];
  blocks?: BlockQuery;
}
