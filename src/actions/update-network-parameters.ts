import db from "src/db";
import logger from "src/utils/logger-handler";
import { EventsProcessed, EventsQuery } from "src/interfaces/block-chain-service";
import { updateNetworkParameters } from "src/modules/update-network-params";
import { Web3Connection } from "@taikai/dappkit";

export const name = "UpdateNetworkParameters";
export const schedule = "0 0 * * *";
export const description = "update network parameters on database";
export const author = "Vitor Hugo";

export async function action(query?: EventsQuery): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};

  logger.info(`${name} start`);

  if (!query || !query?.chainId || !query?.address) {
    logger.info(`${name} missing parameters`);
    return eventsProcessed;
  }

  const { chainId, address } = query;

  const chain = await db.chains.findOne({
    where: {
      chainId: +chainId
    }
  });

  if (!chain) {
    logger.info(`${name} invalid chain ${chainId}`);
    return eventsProcessed;
  }

  try {
    const connection = new Web3Connection({
      web3Host: chain.privateChainRpc,
      skipWindowAssignment: true,
    });
    await connection.start();

    await updateNetworkParameters({
      networkAddress: address,
      chainId: +chainId,
      connection
    });

    eventsProcessed[address] = ["updated"];

    logger.info(`${name} parameters saved ${address} ${chainId}`);
  } catch (error: any) {
    logger.error(`${name} Failed to save parameters of ${address} ${chainId}`, error?.message || error.toString());
  }

  return eventsProcessed;
}
