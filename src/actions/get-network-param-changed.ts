import logger from "src/utils/logger-handler";
import { EventsProcessed, EventsQuery } from "src/interfaces/block-chain-service";
import { DecodedLog } from "src/interfaces/block-sniffer";
import { NetworkParamChanged } from "@taikai/dappkit/dist/src/interfaces/events/network-v2-events";
import { updateNetworkParameters } from "src/modules/update-network-params";

export const name = "GetNetworkParamChanged";
export const schedule = "0 0 * * *";
export const description = "update network parameters on database";
export const author = "Vitor Hugo";

export async function action(block: DecodedLog<NetworkParamChanged['returnValues']>, query?: EventsQuery): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};
  const { address: networkAddress, chainId, connection } = block;

  logger.info(`${name} start`);

  try {
    await updateNetworkParameters({
      networkAddress,
      chainId,
      connection
    });

    eventsProcessed[networkAddress] = ["updated"];

    logger.info(`${name} parameters saved ${networkAddress} ${chainId}`);
  } catch (error: any) {
    logger.error(`${name} Failed to save parameters of ${networkAddress} ${chainId}`, error?.message || error.toString());
  }

  return eventsProcessed;
}
