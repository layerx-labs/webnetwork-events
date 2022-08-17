import { networksAttributes as NetworkProps } from "src/db/models/networks";
import { Bounty } from "./bounties";

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

export type BountiesProcessed = {
  [issueId: string]: { bounty: Bounty; eventBlock: {} | null };
};

export interface EventsProcessed {
  [networkName: string]: BountiesProcessed | string[];
}
