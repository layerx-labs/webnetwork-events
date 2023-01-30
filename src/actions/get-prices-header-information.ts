import db from "src/db";
import logger from "src/utils/logger-handler";
import {
  EventsProcessed,
  EventsQuery,
} from "src/interfaces/block-chain-service";
import { Network_v2, Web3Connection } from "@taikai/dappkit";
import { getCoinPrice } from "src/services/coingecko";
import BigNumber from "bignumber.js";
import { Op } from "sequelize";

export const name = "getPricesHeaderInformation";
export const schedule = "*/15 * * * *";
export const description = "";
export const author = "MarcusviniciusLsantos";

const {
  NEXT_PUBLIC_WEB3_CONNECTION: web3Host,
  NEXT_WALLET_PRIVATE_KEY: privateKey,
  NEXT_PUBLIC_CURRENCY_MAIN: currency
} = process.env;

export async function action(query?: EventsQuery): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};
  logger.info(`${name} start`);

  try {
    const web3Connection = new Web3Connection({ web3Host, privateKey });
    await web3Connection.start();
    const networks = await db.networks.findAll({ where: { isClosed: false } });

    const tokensByFiat: BigNumber[] = [];
    const prices_used: any = {};

    for (const { networkAddress, id: network_id } of networks) {
      const _network = new Network_v2(web3Connection, networkAddress);
      await _network.loadContract();
      const symbol = await _network.networkToken.symbol();
      const tokenPrice = await getCoinPrice(symbol, currency || 'eur');

      if (tokenPrice > 0) {
        const tokenslocked = await db.curators
          .findAll({ where: { networkId: network_id } })
          .then((data) =>
            data.map((curator) => BigNumber(curator.tokensLocked || 0))
          );

        const totalTokensLocked = tokenslocked.reduce(
          (acc, tokens) => tokens.plus(acc),
          BigNumber(0)
        );

        tokensByFiat.push(totalTokensLocked.multipliedBy(tokenPrice));
        prices_used[symbol] = {[currency || 'eur']: tokenPrice}
      }

      prices_used.updatedAt = new Date()
      const totalFiat = tokensByFiat.reduce((acc, value) =>  value.plus(acc), BigNumber(0)).toFixed()

      const numberIssues = await db.issues.count({
        where: {
          state: {[Op.not]: "pending"}
        }
      });
      
      const [headerInformation, created] = await db.header_information.findOrCreate({
        where: {
          id: 1,
        },
        defaults: {
          bounties: numberIssues,
          TVL: totalFiat,
          number_of_network: networks.length,
          last_price_used: prices_used,
        },
      });

      if (!created) {
        headerInformation.TVL = totalFiat
        headerInformation.number_of_network = networks.length
        headerInformation.bounties = numberIssues
        headerInformation.last_price_used = prices_used 
        await headerInformation.save();
      }

      eventsProcessed['header-information'] = networks ? networks.map(n => n.name): []
      logger.info(`${name} updated Header values`)

    }
  } catch (err: any) {
    logger.error(`${name} Error`, err?.message || err.toString());
  }

  return eventsProcessed;
}
