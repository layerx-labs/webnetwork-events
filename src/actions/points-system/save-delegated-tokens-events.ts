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
        association: "network",
        include: [
          { association: "network_token_token" }
        ]
      }
    ],
  });

  const totalConvertedByCurator = {};
  const tokensPrices = {};

  for (const delegation of delegations) {
    const tokenPrice = await getOrUpdateLastTokenPrice(delegation.network.network_token_id!);
    const convertedAmount = +delegation.amount! * tokenPrice;
    tokensPrices[delegation.network.network_token_token.symbol] = tokenPrice;
    totalConvertedByCurator[delegation.from] = (totalConvertedByCurator[delegation.from] || 0) + convertedAmount;
  }

  for (const address in totalConvertedByCurator) {
    await savePointEvent( "delegated",
                          address,
                          { 
                            tokensPrices,
                            delegations: delegations
                              .filter(c => c.from.toLowerCase() === address.toLowerCase())
                              .map(({ from, to, amount, networkId }) => ({ from, to, amount, networkId })) 
                          },
                          (pointsPerAction, scalingFActor) => pointsPerAction * scalingFActor * totalConvertedByCurator[address]);
  }

  logger.info(`${name} finished`);
}