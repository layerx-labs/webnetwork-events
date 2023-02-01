import { Network_v2, Web3Connection } from "@taikai/dappkit";
import BigNumber from "bignumber.js";
import { Op } from "sequelize";
import db from "src/db";
import logger from "src/utils/logger-handler";

const {
  NEXT_PUBLIC_WEB3_CONNECTION: web3Host,
  NEXT_PUBLIC_CURRENCY_MAIN: currency,
} = process.env;

async function headerInformationData() {
  const headerInformation = await db.header_information.findAll({});

  if (!headerInformation) {
    logger.error("Update Price Header failed - Header information not found");
    return;
  }

  return headerInformation[0];
}

export async function updatePriceHeader() {
  try {
    const headerInformation = await headerInformationData();

    if (headerInformation) {
      const web3Connection = new Web3Connection({ web3Host });
      await web3Connection.start();
      const networks = await db.networks.findAll({
        where: { isClosed: false },
      });

      const tokens: {
        TVL: BigNumber;
        symbol: string;
      }[] = [];

      for (const { networkAddress, id: network_id } of networks) {
        const _network = new Network_v2(web3Connection, networkAddress);
        await _network.loadContract();
        const symbol = await _network.networkToken.symbol();

        const tokenslocked = await db.curators
          .findAll({ where: { networkId: network_id } })
          .then((data) =>
            data.map((curator) => BigNumber(curator.tokensLocked || 0))
          );

        const totalTokensLocked = tokenslocked.reduce(
          (acc, value) => value.plus(acc),
          BigNumber(0)
        );

        tokens.push({ TVL: totalTokensLocked, symbol });
      }

      const totalFiat = tokens
        .map(({ TVL, symbol }) =>
          TVL.multipliedBy(
            headerInformation.last_price_used?.[symbol.toLowerCase()]?.[
              currency || "eur"
            ]
          )
        )
        .reduce((acc, value) => value.plus(acc), BigNumber(0))
        .toFixed();

      headerInformation.TVL = totalFiat;
      await headerInformation.save();

      logger.info(`HeaderInformation: Updated TVL(Price)`);
    }
  } catch (err: any) {
    logger.error(
      `HeaderInformation: Update Price Header Error`,
      err?.message || err.toString()
    );
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
