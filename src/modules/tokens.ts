import { Op } from "sequelize";

import db from "src/db";
import { tokens } from "src/db/models/tokens";

const { EVENTS_CHAIN_ID: chainId } = process.env;

export async function findOrCreateToken(address: string,
                                        name: string,
                                        symbol: string,
                                        isTransactional = false,
                                        isReward = false,
                                        isAllowed = false): Promise<tokens | undefined> {
  try {
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
        isReward: isReward
      }
    });

    return token;
  } catch (error: any) {
    console.log(`Failed to findOrCreate token ${address}`, error.toString());

    return undefined;
  }
}