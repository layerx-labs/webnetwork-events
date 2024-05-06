import {Op} from "sequelize";

import db from "src/db";
import {tokens} from "src/db/models/tokens";
import loggerHandler from "../utils/logger-handler";
import { getCoinIconByChainAndContractAddress, getCoinPrice } from "src/services/coingecko";

const {
  NEXT_PUBLIC_CURRENCY_MAIN: defaultCurrency = "eur",
} = process.env;

export async function findOrCreateToken(address: string,
                                        name: string,
                                        symbol: string,
                                        chainId: number,
                                        isTransactional = false,
                                        isReward = false,
                                        isAllowed = false): Promise<tokens | undefined> {
  try {
    const icon = await getCoinIconByChainAndContractAddress(address, chainId) || undefined
    const [token, ] = await db.tokens.findOrCreate({
      where: {
        address: {
          [Op.iLike]: address
        },
        chain_id: chainId
      },
      defaults: {
        name: name,
        symbol: symbol,
        address: address,
        isAllowed: isAllowed,
        isTransactional: isTransactional,
        isReward: isReward,
        icon
      }
    });

    return token;
  } catch (error: any) {
    loggerHandler.error(`Failed to findOrCreate token ${address}`, error.toString());

    return undefined;
  }
}

export async function getOrUpdateLastTokenPrice(tokenId: number, currency = defaultCurrency) {
  const token = await db.tokens.findOne({
    where: {
      id: tokenId
    }
  });

  if (!token?.last_price_used?.[currency]) {
    const currentPrice =  await getCoinPrice(token!.symbol, currency);

    token!.last_price_used = {
      ...token?.last_price_used,
      ...currentPrice[token!.symbol.toLowerCase()],
      updatedAt: new Date(),
    };

    await token?.save();
  }

  return token?.last_price_used?.[currency];
}