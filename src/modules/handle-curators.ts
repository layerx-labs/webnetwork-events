import BigNumber from "bignumber.js";
import db from "src/db";
import { curators } from "src/db/models/curators";

export async function handleCurators(
  address: string,
  totalVotes: BigNumber,
  councilAmount: number | string,
  networkId: number
) {
  const isCurator = totalVotes.gte(councilAmount);
  const curatorInDb = await db.curators.findOne({ where: { address, networkId } });

  if (curatorInDb) {
    curatorInDb.isCurrentlyCurator = isCurator;
    curatorInDb.tokensLocked = totalVotes.toFixed();

    await curatorInDb.save();

    return curatorInDb
  } else if (!curatorInDb && isCurator) {
   return await db.curators.create({
      address,
      networkId,
      isCurrentlyCurator: true,
      tokensLocked: totalVotes.toFixed(),
    });
  }

  return null;
}

export async function updateCuratorProposalParams(curator: curators, param: "acceptedProposals" | "disputedProposals" ) {
  curator[param] +=  1
  return curator.save()
}
