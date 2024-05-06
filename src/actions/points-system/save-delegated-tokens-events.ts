import { Op } from "sequelize";

import db from "src/db";

import logger from "src/utils/logger-handler";
import { getOrUpdateLastTokenPrice } from "src/modules/tokens";
import { savePointEvent } from "../../modules/points-system/save-point-event";

export const name = "SaveDelegatedTokensEvents";
export const schedule = "0 0 * * *";
export const description = "Save delegated tokens events on database";
export const author = "Vitor Hugo";

export async function action() {
  logger.info(`${name} start`);

  const delegations = await db.delegations.findAll({
    include: [
      {
        association: "network"
      }
    ],
  });

  const totalConvertedByCurator = {};

  for (const delegation of delegations) {
    const tokenPrice = await getOrUpdateLastTokenPrice(delegation.network.network_token_id!);
    const convertedAmount = +delegation.amount! * tokenPrice;
    totalConvertedByCurator[delegation.from] = (totalConvertedByCurator[delegation.from] || 0) + convertedAmount;
  }

  for (const address in totalConvertedByCurator) {
    await savePointEvent( "delegated",
                          address,
                          (pointsPerAction, scalingFActor) => pointsPerAction * scalingFActor * totalConvertedByCurator[address]);
  }

  logger.info(`${name} finished`);
}