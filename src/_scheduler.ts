import db from "./db";
import {Op} from "sequelize";
import {nativeZeroAddress} from "@taikai/dappkit/dist/src/utils/constants";
import {chainsAttributes} from "./db/models/chains";
import NetworkRegistry from "@taikai/dappkit/dist/build/contracts/NetworkRegistry.json";
import NetworkV2 from "@taikai/dappkit/dist/build/contracts/NetworkV2.json";
import {action as NetworkRegistered} from "./actions/get-network-registered-events";
import {action as ChangeAllowedTokens} from "./actions/get-change-allowed-tokens-events";

import {action as BountyAmountUpdate} from "src/actions/get-bounty-amount-updated-event";
import {action as BountyCanceled} from "src/actions/get-bounty-canceled-event";
import {action as BountyClosed} from "src/actions/get-bounty-closed-event";
import {action as BountyCreated} from "src/actions/get-bounty-created-event";
import {action as BountyFundedUpdate} from "src/actions/get-bounty-funded-updated-event";
import {action as BountyMovedToOpen} from "src/actions/get-bounty-moved-to-open";
import {action as NetworkCreated} from "src/actions/get-network-registered-events";
import {action as OraclesChanged} from "src/actions/get-oracles-changed-events";
import {action as ProposalCreated} from "src/actions/get-proposal-created-event";
import {action as ProposalDisputed} from "src/actions/get-proposal-disputed-event";
import {action as ProposalRefused} from "src/actions/get-proposal-refused-event";
import {action as PullRequestCanceled} from "src/actions/get-pullrequest-canceled-event";
import {action as PullRequestCreated} from "src/actions/get-pullrequest-created-event";
import {action as PullRequestReadyForReview} from "src/actions/get-pullrequest-ready-for-review";
import {action as OraclesTransfer} from "src/actions/get-oracles-transfer-events";
import {action as Transfer} from "src/actions/get-transfer-bounty-token-events";
import {action as UpdateBountiesToDraft} from 'src/actions/update-bounties-to-draft'

const REGISTRY_EVENTS = {
  NetworkRegistered,
  ChangeAllowedTokens,
  Transfer
}

const NETWORK_EVENTS = {
  BountyAmountUpdate, BountyCanceled, BountyClosed, BountyCreated, BountyFundedUpdate, BountyMovedToOpen,
  NetworkCreated, OraclesChanged, ProposalCreated, ProposalDisputed, ProposalRefused, PullRequestCanceled,
  PullRequestCreated, PullRequestReadyForReview, OraclesTransfer, UpdateBountiesToDraft
}

async function main() {
  const chains = await db.chains.findAll({where: {registryAddress: {[Op.not]: undefined}}, raw: true});

  const chainsReducer = (p, {
    chainRpc,
    registryAddress = nativeZeroAddress,
    chainId
  }: chainsAttributes): { [chainRpc: string]: { registryAddress: string, chainId: number } } =>
    ({...p, [chainRpc]: {registryAddress, chainId}})

  const networksReducer = (networks: string[]) =>
    networks.reduce((p, c) =>
      ({...p, [c]: {abi: NetworkV2.abi, events: NETWORK_EVENTS}}), {})

  const entriesChainRegistryNetworksReducer = (p, [rpc, {registryAddress, networks}]) =>
    ({
      ...p,
      [rpc]: {
        [registryAddress]: {abi: NetworkRegistry.abi, events: REGISTRY_EVENTS},
        ...networksReducer(networks)
      }
    })

  Promise.all(
      Object.entries(chains.reduce(chainsReducer, {}))
        .map(([rpc, info]) =>
          db.networks.findAll({where: {chain_id: info.chainId, networkAddress: {[Op.not]: undefined}}, raw: true})
            .then(networks => networks.map(network => network.networkAddress!))
            .then(networks => [rpc, {
              ...info,
              networks
            }] as ([string, { registryAddress: string, chainId: number, networks: string[] }]))))
    .then((array) => array.reduce(entriesChainRegistryNetworksReducer, {}));
}



