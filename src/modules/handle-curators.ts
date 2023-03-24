import BigNumber from "bignumber.js";
import db from "src/db";
import {curators} from "src/db/models/curators";
import loggerHandler from "../utils/logger-handler";
import { OraclesResume } from "@taikai/dappkit";

export async function handleCurators(
  address: string,
  votesResume: OraclesResume,
  councilAmount: number | string,
  networkId: number
) {
  const { locked, delegatedByOthers } = votesResume;

  const isCurator = BigNumber(locked).gte(councilAmount);
  const curatorInDb = await db.curators.findOne({where: {address, networkId}});

  loggerHandler.debug(`handleCurators(${address}, ${locked}, ${councilAmount}, ${networkId})`)

  if (curatorInDb) {
    curatorInDb.isCurrentlyCurator = isCurator;
    curatorInDb.tokensLocked = locked.toString();
    curatorInDb.delegatedToMe = delegatedByOthers.toString();

    await curatorInDb.save();
    return curatorInDb
  } else if (!curatorInDb) {
    return await db.curators.create({
      address,
      networkId,
      isCurrentlyCurator: isCurator,
      tokensLocked: locked.toString(),
      delegatedToMe: delegatedByOthers.toString()
    });
  }

  return null;
}

export async function updateCuratorProposalParams(curator: curators, param: "acceptedProposals" | "disputedProposals", type: "add" | "remove") {
  // @ts-ignore
  if(type === 'add') curator[param] +=  1
  // @ts-ignore
  if(type === 'remove') curator[param] -=  1
  
  return curator.save()
}