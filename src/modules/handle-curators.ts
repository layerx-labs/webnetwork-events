import BigNumber from "bignumber.js";
import db from "src/db";
import {curators} from "src/db/models/curators";
import loggerHandler from "../utils/logger-handler";
import { OraclesResume } from "@taikai/dappkit";
import { Delegation } from "@taikai/dappkit/dist/src/interfaces/delegation";
import { Op } from "sequelize";

async function clearTakedBackDelegations(curator, delegations: Delegation[]) {
  const currentDelegationsIds = delegations.map(({ id }) => id);

  if (!currentDelegationsIds.length) return;

  await db.delegations.destroy({
    where: {
      curatorId: curator.id,
      contractId: {
        [Op.notIn]: currentDelegationsIds
      }
    }
  });
}

async function handleDelegation(curator, delegation: Delegation) {
  const { from, to, amount, id } = delegation;

  await db.delegations.findOrCreate({
    where: {
      from: from,
      to: to,
      amount: amount,
      contractId: id,
      curatorId: curator.id,
      networkId: curator.networkId,
      chainId: curator.network.chain_id
    }
  });
}

export async function handleCurators(
  address: string,
  votesResume: OraclesResume,
  councilAmount: number | string,
  networkId: number
) {
  const { locked, delegatedByOthers, delegations } = votesResume;

  loggerHandler.debug(`handleCurators(${address}, ${locked}, ${councilAmount}, ${networkId})`)

  const isCurator = BigNumber(locked).gte(councilAmount);

  const [curator, created] = await db.curators.findOrCreate({
    where: {
      address,
      networkId
    },
    defaults: {
      address,
      networkId,
      isCurrentlyCurator: isCurator,
      tokensLocked: locked.toString(),
      delegatedToMe: delegatedByOthers.toString()
    },
    include: [
      {
        association: "network",
        include: [
          {
            association: "chain"
          }
        ]
      }
    ]
  });

  if (!created) {
    curator.isCurrentlyCurator = isCurator;
    curator.tokensLocked = locked.toString();
    curator.delegatedToMe = delegatedByOthers.toString();

    await curator.save();
  }

  await clearTakedBackDelegations(curator, delegations);

  await Promise.all(delegations.map(delegation => handleDelegation(curator, delegation)));

  return curator;
}

export async function updateCuratorProposalParams(curator: curators, param: "acceptedProposals" | "disputedProposals", type: "add" | "remove") {
  // @ts-ignore
  if(type === 'add') curator[param] +=  1
  // @ts-ignore
  if(type === 'remove') curator[param] -=  1
  
  return curator.save()
}