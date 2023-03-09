import NetworkRegistry from "@taikai/dappkit/dist/build/contracts/NetworkRegistry.json";
import NetworkV2 from "@taikai/dappkit/dist/build/contracts/NetworkV2.json";

import {BlockSniffer} from "./services/block-sniffer";
import {MIDNIGHT_ACTIONS, MINUTE_ACTIONS, NETWORK_EVENTS, REGISTRY_EVENTS} from "./modules/chain-events";
import {findOnABI} from "./utils/find-on-abi";
import loggerHandler from "./utils/logger-handler";
import {differenceInMilliseconds, formatDistance} from "date-fns";
import {clearTimeout} from "timers";
import {MappedEventActions} from "./interfaces/block-sniffer";
import {getChainsRegistryAndNetworks} from "./utils/block-process";
import {GlobalCatcher} from "./utils/global-catcher";

GlobalCatcher();

let restarter: NodeJS.Timer | null = null;

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
    .then(mappedRpcActions => {

      const sniffers = Object.entries(mappedRpcActions)
        .map(([rpc, mappedActions]) => new BlockSniffer(rpc, mappedActions))

      loggerHandler.info(`_scheduler started ${sniffers.length} sniffers`);

      if (!sniffers.length) {
        loggerHandler.info(`_scheduler found no chains, will retry in 10s`)
        restarter = setTimeout(() => startChainListeners(), 10 * 1000);
      } else {
        if (restarter) {
          clearTimeout(restarter!);
          restarter = null;
        }
      }

    })
    .catch(e => {
      loggerHandler.error(`_scheduler chainListener error`, e);
    })
}

function startTimedEvents() {

  const startTimeoutForMidnightAction = (key, callback) => {
    const now = new Date();
    const next24 = new Date().setHours(24, 0, 0, 0);
    const diff = differenceInMilliseconds(next24, now);

    loggerHandler.info(`_scheduler calling ${key} in ${formatDistance(next24, now)}`);

    setTimeout(() => {
      try {
        loggerHandler.debug(`_scheduler midnight calling ${key}`);
        callback();
        startTimeoutForMidnightAction(key, callback); // start itself when over
      } catch (e) {
        loggerHandler.error(`_scheduler Midnight:${key}`, e);
      }
    }, diff);

  }

  const startIntervalForMinuteAction = (key, callback) => {
    loggerHandler.info(`_scheduler calling ${key} in about a minute`);

    setInterval(() => {
      try {
        loggerHandler.info(`_scheduler minute calling ${key}`);
        callback();
      } catch (e: any) {
        loggerHandler.error(`_scheduler Minute:${key}`, e?.stack);
      }
    }, 1000 * 60);
  }

  Object.entries(MIDNIGHT_ACTIONS).forEach(([k, cb]) => startTimeoutForMidnightAction(k, cb))
  Object.entries(MINUTE_ACTIONS).forEach(([k, cb]) => startIntervalForMinuteAction(k, cb))

}

(async () => {
  startChainListeners();
  startTimedEvents();
})()
  .catch(e => {
    loggerHandler.info(`Scheduler Error outside the global catcher`, e);
  })


