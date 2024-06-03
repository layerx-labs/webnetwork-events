import { Network_v2, Web3Connection } from "@taikai/dappkit";

import db from "src/db";
import { handleCurators } from "src/modules/handle-curators";

type UpdateNetworkParametersProps = {
  networkAddress: string,
  chainId: number,
  connection: Web3Connection,
}
export async function updateNetworkParameters({
  networkAddress,
  chainId,
  connection
}: UpdateNetworkParametersProps) {
  const networkOnDb = await db.networks.findOne({
    where: {
      networkAddress: networkAddress,
      chain_id: chainId
    },
    include: [{ association: "curators", required: false }],
  });

  if (!networkOnDb) {
    throw new Error(`Network with address ${networkAddress} not found for chain ${chainId}`);
  }

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
}