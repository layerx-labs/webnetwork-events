import { chainsAttributes } from "src/db/models/chains";
import { deliverablesAttributes } from "src/db/models/deliverables";
import { issuesAttributes } from "src/db/models/issues";
import { networksAttributes } from "src/db/models/networks";
import { tokensAttributes } from "src/db/models/tokens";

export interface Deliverables extends deliverablesAttributes {}

export interface Bounty extends issuesAttributes {
  deliverables?: Deliverables[];
  transactionalToken: tokensAttributes;
  network?: Network;
}

interface Network extends networksAttributes {
  chain?: chainsAttributes;
}

type amount  = {
  value: string;
  percentage: string;
}

export interface DistributedAmounts {
  treasuryAmount: amount;
  mergerAmount: amount;
  proposerAmount: amount;
  proposals: {
    value: string;
    percentage: string;
    recipient: string;
    githubLogin?: string;
  }[];
}