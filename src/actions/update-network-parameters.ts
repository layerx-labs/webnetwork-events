import db from "src/db";
import logger from "src/utils/logger-handler";
import { EventsProcessed, EventsQuery } from "src/interfaces/block-chain-service";
import { Network_v2 } from "@taikai/dappkit";
import { handleCurators } from "src/modules/handle-curators";
import { DecodedLog } from "src/interfaces/block-sniffer";
import { NetworkParamChanged } from "@taikai/dappkit/dist/src/interfaces/events/network-v2-events";

export const name = "NetworkParamChanged";
export const schedule = "0 0 * * *";
export const description = "update network parameters on database";
export const author = "Vitor Hugo";

export async function action(block: DecodedLog<NetworkParamChanged['returnValues']>, query?: EventsQuery): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};
  const { address: networkAddress, chainId, connection } = block;

  logger.info(`${name} start`);

  const networkOnDb = await db.networks.findOne({
    where: {
      networkAddress: networkAddress,
      chain_id: chainId
    },
    include: [{ association: "curators", required: false }],
  });

  if (!networkOnDb) {
    logger.warn(`${name} network with address ${networkAddress} not found for chain ${chainId}`);
    return eventsProcessed;
  }

  try {
    const networkContract = new Network_v2(connection, networkOnDb.networkAddress);
    await networkContract.start();
    const councilAmount = await networkContract.councilAmount();
    const needsToUpdateCurators = councilAmount !== networkOnDb.councilAmount;

    networkOnDb.councilAmount = councilAmount;
    networkOnDb.disputableTime = (await networkContract.disputableTime()) / 1000;
    networkOnDb.draftTime = (await networkContract.draftTime()) / 1000;
    networkOnDb.oracleExchangeRate = await networkContract.oracleExchangeRate();
    networkOnDb.mergeCreatorFeeShare = await networkContract.mergeCreatorFeeShare();
    networkOnDb.percentageNeededForDispute = await networkContract.percentageNeededForDispute();
    networkOnDb.cancelableTime = (await networkContract.cancelableTime()) / 1000;
    networkOnDb.proposerFeeShare = await networkContract.proposerFeeShare();

    await networkOnDb.save();

    if (needsToUpdateCurators) {
      await Promise.all(networkOnDb.curators.map(async (curator) => {
        const actorVotesResume = await networkContract.getOraclesResume(curator.address);
        await handleCurators(curator.address, actorVotesResume, councilAmount, networkOnDb.id);
      }));

      const currentCurators = await db.curators.findAll({
        where: {
          isCurrentlyCurator: true,
          networkId: networkOnDb.id
        }
      });

      networkOnDb.councilMembers = currentCurators.map(({ address }) => address);
      await networkOnDb.save();
    }

    eventsProcessed[networkOnDb.name!] = ["updated"];

    logger.info(`${name} parameters saved ${networkOnDb.name} ${networkOnDb.networkAddress}`);
  } catch (error: any) {
    logger.error(`${name} Failed to save parameters of ${networkOnDb.name} ${networkOnDb.networkAddress}`, error?.message || error.toString());
  }

  return eventsProcessed;
}
