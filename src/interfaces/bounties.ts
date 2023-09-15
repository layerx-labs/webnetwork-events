import { chainsAttributes } from "src/db/models/chains";
import { deliverableAttributes } from "src/db/models/deliverables";
import { issuesAttributes } from "src/db/models/issues";
import { networksAttributes } from "src/db/models/networks";
import { repositoriesAttributes } from "src/db/models/repositories";
import { tokensAttributes } from "src/db/models/tokens";

export interface Repository extends repositoriesAttributes {}

export interface Deliverables extends deliverableAttributes {}

export interface Bounty extends issuesAttributes {
  repository?: Repository;
  deliverables?: Deliverables[];
  transactionalToken: tokensAttributes;
  network?: Network;
}

interface Network extends networksAttributes {
  chain?: chainsAttributes;
}
