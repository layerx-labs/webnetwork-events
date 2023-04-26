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
    logger.debug(`updatePriceHeader`);

    const headerInformation = await headerInformationData();

    const networks = await db.networks.findAll({
      where: { 
        isClosed: false,
        isRegistered: true,
      },
      include: [
        { association: "network_token_token" },
        { 
          association: "curators",
          required: false
        }
      ]
    });

    if (networks.length === 0) {
      return {
        processed: [],
        message: `updatePriceHeader no networks found`
      };
    }

    const header = {
      tvl: BigNumber(0),
      lastPrice: {}
    };

    const symbols = networks.map(({ network_token_token: { symbol } }) => symbol);
    const prices = addMinutes(new Date(headerInformation?.updatedAt!), +(headerTtl || 0)) < new Date() ? 
      await getCoinPrice(symbols.join(), currency || 'eur') : 
      headerInformation?.last_price_used;

    header.tvl = networks.reduce((acc, current) => {
      const { network_token_token, curators } = current;
      const symbol = network_token_token.symbol.toLowerCase();

      const totalLocked = curators.reduce((acc, { tokensLocked, delegatedToMe }) => acc.plus(tokensLocked || 0).plus(delegatedToMe || 0), BigNumber(0));
      
      const price = prices.hasOwnProperty(symbol) ? prices[symbol][currency!] : 
        headerInformation?.last_price_used?.hasOwnProperty(symbol) ? headerInformation.last_price_used[symbol][currency!] : 0;

      return acc.plus(totalLocked.multipliedBy(price || 0));
      
    }, BigNumber(0));

    header.lastPrice = {
      ...headerInformation?.last_price_used,
      ...prices,
      updatedAt: new Date()
    };

    headerInformation.TVL = header.tvl.toFixed();
    headerInformation.last_price_used = header.lastPrice;
    
    await headerInformation.save();

    logger.debug(`updatePriceHeader saved`);

    return {
      processed: networks.map(n => n.name!),
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
          visible: true,
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
