import process from "node:process";
import {Worker} from "bullmq";
import {NETWORK_EVENTS, REGISTRY_EVENTS} from "../modules/chain-events";
import {getWeb3Host} from "../utils/get-web3-host";
import loggerHandler from "../utils/logger-handler";
import {saveProcessedBlock} from "../utils/save-processed-block";

const {NEXT_REDIS_HOST: host, NEXT_REDIS_PORT: port, NEXT_ENV_NAME: envName,} = process.env;

const connection = {connection: {host, port: port && +port || 6379}}

const networkProcessor = async ({data}) => {
  try {
    /* Network actions need `web3host` information, so they can fetch information from the chain */
    await NETWORK_EVENTS[data.event]?.({...data, connection: await getWeb3Host(data.chainId)});
  } catch (e: any) {
    loggerHandler.error(`Error NETWORK parsing ${data.event}: ${e.message}`);
  } finally {
    await saveProcessedBlock(data.blockNumber, data.event, data.chainId, data.address);
  }
}

const registryProcessor = async ({data}) => {
  try {
    await REGISTRY_EVENTS[data.event]?.(data);
  } catch (e: any) {
    loggerHandler.error(`Error parsing REGISTRY event ${data.event}: ${e.message}`);
  } finally {
    await saveProcessedBlock(data.blockNumber, data.event, data.chainId, data.address);
  }
}

new Worker(`${envName}_network_queue`, networkProcessor, connection);
new Worker(`${envName}_registry_queue`, registryProcessor, connection);
