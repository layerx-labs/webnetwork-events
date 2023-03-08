import db from "./db";
import {Op} from "sequelize";
import {nativeZeroAddress} from "@taikai/dappkit/dist/src/utils/constants";
import {chainsAttributes} from "./db/models/chains";
import NetworkRegistry from "@taikai/dappkit/dist/build/contracts/NetworkRegistry.json";
import NetworkV2 from "@taikai/dappkit/dist/build/contracts/NetworkV2.json";

import {BlockSniffer, MappedEventActions} from "./services/block-sniffer";
import {NETWORK_EVENTS, REGISTRY_EVENTS} from "./modules/chain-events";
import {findOnABI} from "./utils/find-on-abi";


async function getChainsRegistryAndNetworks() {

  const chainsReducer = (p, {
    chainRpc,
    registryAddress = nativeZeroAddress,
    chainId
  }: chainsAttributes): { [chainRpc: string]: { registryAddress: string, chainId: number } } =>
    ({...p, [chainRpc]: {registryAddress, chainId}})

  const chains = await db.chains.findAll({where: {registryAddress: {[Op.not]: undefined}}, raw: true});

  return Promise.all(
    Object.entries(chains.reduce(chainsReducer, {}))
      .map(([rpc, info]) =>
        db.networks.findAll({where: {chain_id: info.chainId, networkAddress: {[Op.not]: undefined}}, raw: true})
          .then(networks => networks.map(network => network.networkAddress!))
          .then(networks => [rpc, {
            ...info,
            networks
          }] as ([string, { registryAddress: string, chainId: number, networks: string[] }]))))
}

async function startChainListeners() {

  const _registryABIVents = {abi: findOnABI(NetworkRegistry.abi, Object.keys(REGISTRY_EVENTS)), events: REGISTRY_EVENTS}
  const _networkABIVents = {abi: findOnABI(NetworkV2.abi, Object.keys(NETWORK_EVENTS)), events: NETWORK_EVENTS}

  const networksReducer = (networks: string[]) =>
    networks.reduce((p, c) => ({...p, [c]: _registryABIVents}), {})

  const entriesChainRegistryNetworksReducer = (p, [rpc, {
    registryAddress,
    networks
  }]): { [rpc: string]: MappedEventActions } =>
    ({...p, [rpc]: {[registryAddress]: _networkABIVents, ...networksReducer(networks)}})

  getChainsRegistryAndNetworks()
    .then((array) => array.reduce(entriesChainRegistryNetworksReducer, {}))
    .then(mappedRpcActions =>
      Object.entries(mappedRpcActions)
        .map(([rpc, mappedActions]) => new BlockSniffer(rpc, mappedActions)))
}

async function startTimedEvents() {


}



