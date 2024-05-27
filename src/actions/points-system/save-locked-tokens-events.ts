import { Op } from "sequelize";

import db from "src/db";

import logger from "src/utils/logger-handler";
import { getOrUpdateLastTokenPrice } from "src/modules/tokens";
import { savePointEvent } from "../../modules/points-system/save-point-event";
import { CHAIN_IDS } from "src/utils/constants";

export const name = "SaveLockedTokensEvents";
export const schedule = "0 0 * * *";
export const description = "Save locked tokens events on database";
export const author = "Vitor Hugo";

const { EVENTS_CHAIN_ID } = process.env;

export async function action() {
  if (!!EVENTS_CHAIN_ID && +EVENTS_CHAIN_ID !== CHAIN_IDS.polygon) {
    logger.info(`${name} skipped because is not events polygon instance`, EVENTS_CHAIN_ID);
    return;
  }

  logger.info(`${name} start`);

  const curators = await db.curators.findAll({
    where: {
      tokensLocked: {
        [Op.not]: "0"
      }
    },
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

  for (const curator of curators) {
    const tokenPrice = await getOrUpdateLastTokenPrice(curator.network.network_token_id!);
    const convertedAmount = +curator.tokensLocked! * tokenPrice;
    tokensPrices[curator.network.network_token_token.symbol] = tokenPrice;
    totalConvertedByCurator[curator.address] = (totalConvertedByCurator[curator.address] || 0) + convertedAmount;
  }

  for (const address in totalConvertedByCurator) {
    await savePointEvent( "locked",
                          address,
                          { 
                            tokensPrices,
                            curators: curators
                              .filter(c => c.address.toLowerCase() === address.toLowerCase())
                              .map(({ tokensLocked, networkId }) => ({ tokensLocked, networkId })) 
                          },
                          (pointsPerAction, scalingFActor) => pointsPerAction * scalingFActor * totalConvertedByCurator[address]);
  }

  logger.info(`${name} finished`);
}