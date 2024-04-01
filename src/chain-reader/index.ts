import process from "node:process";
import {Worker} from "bullmq";
import {NETWORK_EVENTS, REGISTRY_EVENTS} from "../modules/chain-events";
import {getWeb3Host} from "../utils/get-web3-host";

const {NEXT_REDIS_HOST: host, NEXT_REDIS_PORT: port, NEXT_ENV_NAME: envName,} = process.env;

const connection = {connection: {host, port: port && +port || 6379}}

const networkProcessor = async ({data}) => {
  /* Network actions need `web3host` information, so they can fetch information from the chain */
  await NETWORK_EVENTS[data.event]?.({...data, connection: await getWeb3Host(data.chainId)});
}

const registryProcessor = async ({data}) => {
  await REGISTRY_EVENTS[data.event]?.(data);
}

new Worker(`${envName}_network_queue`, networkProcessor, connection);
new Worker(`${envName}_registry_queue`, registryProcessor, connection);