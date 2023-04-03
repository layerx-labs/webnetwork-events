import BigNumber from "bignumber.js";
import { addMinutes } from "date-fns";
import { Op } from "sequelize";
import db from "src/db";
import { getCoinPrice } from "src/services/coingecko";
import logger from "src/utils/logger-handler";

const {
  NEXT_PUBLIC_CURRENCY_MAIN: currency,
  HEADER_TTL_MINUTES: headerTtl,
} = process.env;

async function headerInformationData() {
  const [headerInformation,] = await db.header_information.findOrCreate({
    where: {},
    defaults: {
      bounties: 0,
      TVL: "0",
      number_of_network: 0,
      last_price_used: {},
    },
  });

  return headerInformation;
}

export async function updatePriceHeader() {
  try {
    const headerInformation = await headerInformationData();

    const networks = await db.networks.findAndCountAll({
      where: { 
        isClosed: false,
        isRegistered: true,
      },
      include: [
        { association: "network_token_token" },
        { association: "curators" },
        {
          association: "issues",
          where: {
            state: {
              [Op.ne]: "pending"
            }
          }
        }
      ]
    });

    if (networks.count === 0) {
      return {
        processed: [],
        message: `updatePriceHeader no networks found`
      };
    }

    const header = {
      bounties: networks.rows.reduce((acc, { issues }) => acc + issues.length, 0),
      networks: networks.count,
      tvl: BigNumber(0),
      lastPrice: {}
    };

    const symbols = networks.rows.map(({ network_token_token: { symbol } }) => symbol);
    const prices = addMinutes(new Date(headerInformation?.updatedAt!), +(headerTtl || 0)) < new Date() ? 
      await getCoinPrice(symbols.join(), currency || 'eur') : 
      headerInformation?.last_price_used;

    header.tvl = networks.rows.reduce((acc, current) => {
      const { network_token_token, curators } = current;
      const symbol = network_token_token.symbol.toLowerCase();

      const totalLocked = curators.reduce((acc, { tokensLocked }) => acc.plus(tokensLocked || 0), BigNumber(0));

      return acc.plus(totalLocked.multipliedBy(prices[symbol][currency!] || 0));
      
    }, BigNumber(0));

    header.lastPrice = {
      ...prices,
      updatedAt: new Date()
    };

    headerInformation.TVL = header.tvl.toFixed();
    headerInformation.number_of_network = header.networks;
    headerInformation.bounties = header.bounties;
    headerInformation.last_price_used = header.lastPrice;
    
    await headerInformation.save();

    return {
      processed: networks.rows.map(n => n.name!),
      message: `updated Header values`
    };
  } catch (err: any) {
    logger.error(
      `HeaderInformation: Update Price Header Error`,
      err?.message || err.toString()
    );

    return {
      processed: [],
      message: err?.message || err.toString()
    };
  }
}

export async function updateBountiesHeader() {
  try {
    const headerInformation = await headerInformationData();

    if (headerInformation) {
      const numberIssues = await db.issues.count({
        where: {
          state: { [Op.not]: "pending" },
        },
      });

      headerInformation.bounties = numberIssues;
      await headerInformation?.save();
      logger.info(`HeaderInformation: Updated Bounties number`);
    }
  } catch (err: any) {
    logger.error(
      `HeaderInformation: Update Bounties Header Error`,
      err?.message || err.toString()
    );
  }
}

export async function updateNumberOfNetworkHeader() {
  try {
    const headerInformation = await headerInformationData();

    if (headerInformation) {
      const numberNetworks = await db.networks.count({
        where: {
          isRegistered: true
        },
      });

      headerInformation.number_of_network = numberNetworks;
      await headerInformation?.save();
      logger.info(`HeaderInformation: Updated number of network`);
    }
  } catch (err: any) {
    logger.error(
      `HeaderInformation: Update number of network Header Error`,
      err?.message || err.toString()
    );
  }
}
