import BigNumber from "bignumber.js";
import db from "src/db";
import { curators } from "src/db/models/curators";

export async function handleCurators(
  address: string,
  totalVotes: string,
  councilAmount: number | string,
  networkId: number
) {
  const isCurator = BigNumber(totalVotes).gte(councilAmount);
  const curatorInDb = await db.curators.findOne({ where: { address, networkId } });

  if (curatorInDb) {
    curatorInDb.isCurrentlyCurator = isCurator;
    curatorInDb.tokensLocked = totalVotes

    await curatorInDb.save();

    return curatorInDb
  } else if (!curatorInDb && isCurator) {
   return await db.curators.create({
      address,
      networkId,
      isCurrentlyCurator: true,
      tokensLocked: totalVotes
    });
  }

  return null;
}

export async function updateCuratorProposalParams(curator: curators, param: "acceptedProposals" | "disputedProposals" ) {
  // @ts-ignore
  curator[param] +=  1
  return curator.save()
}
