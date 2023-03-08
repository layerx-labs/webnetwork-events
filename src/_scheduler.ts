import db from "./db";
import {Op} from "sequelize";
import {nativeZeroAddress} from "@taikai/dappkit/dist/src/utils/constants";
import {chainsAttributes} from "./db/models/chains";
import NetworkRegistry from "@taikai/dappkit/dist/build/contracts/NetworkRegistry.json";
import NetworkV2 from "@taikai/dappkit/dist/build/contracts/NetworkV2.json";

import {BlockSniffer} from "./services/block-sniffer";
import {MIDNIGHT_ACTIONS, MINUTE_ACTIONS, NETWORK_EVENTS, REGISTRY_EVENTS} from "./modules/chain-events";
import {findOnABI} from "./utils/find-on-abi";
import loggerHandler from "./utils/logger-handler";
import {differenceInMilliseconds, formatDistance} from "date-fns";
import {clearInterval, clearTimeout} from "timers";
import {MappedEventActions} from "./interfaces/block-sniffer";


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

function startChainListeners() {

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
    .catch(e => {
      loggerHandler.error(`_scheduler chainListener error`, e);
    })
}

function startTimedEvents() {

  const timers: { [key: string]: NodeJS.Timer } = {};

  const startTimeoutForMidnightAction = (key, callback) => {
    const now = new Date();
    const next24 = new Date().setHours(24, 0, 0, 0);
    const diff = differenceInMilliseconds(next24, now);

    loggerHandler.info(`_scheduler calling ${key} in ${formatDistance(next24, now)}`);

    timers[key] = setTimeout(() => {
      try {
        loggerHandler.debug(`_scheduler midnight calling ${key}`);
        callback();
        startTimeoutForMidnightAction(key, callback); // start itself when over
      } catch (e) {
        loggerHandler.error(`_scheduler Midnight:${key}`, e);
        clearTimeout(timers[key])
        loggerHandler.info(`_scheduler Stopping ${key} timeout`);
      }
    }, diff);

  }

  const startIntervalForMinuteAction = (key, callback) => {

    timers[key] = setInterval(() => {
      try {
        loggerHandler.debug(`_scheduler minute calling ${key}`);
        callback();
      } catch (e: any) {
        loggerHandler.error(`_scheduler Minute:${key}`, e?.stack);
        loggerHandler.info(`_scheduler Stopping ${key} interval`);
        clearInterval(timers[key]);
      }
    }, 1000 * 60);
  }

  Object.entries(MIDNIGHT_ACTIONS).forEach(([k, cb]) => startTimeoutForMidnightAction(k, cb))
  Object.entries(MINUTE_ACTIONS).forEach(([k, cb]) => startIntervalForMinuteAction(k, cb))

}

(() => {
  startChainListeners();
  startTimedEvents();
})();


