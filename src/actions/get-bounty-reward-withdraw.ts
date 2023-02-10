import db from "src/db";
import logger from "src/utils/logger-handler";
import { Op } from "sequelize";
import {EventsProcessed, EventsQuery,} from "src/interfaces/block-chain-service";
import {Network_v2, Web3Connection} from "@taikai/dappkit";

export const name = "get-bounty-reward-withdraw";
export const schedule = "*/1 * * * *";
export const description = "get withdrawn rewards";
export const author = "Vitor Hugo";

const { NEXT_PUBLIC_WEB3_CONNECTION: web3Host, NEXT_WALLET_PRIVATE_KEY: privateKey, EVENTS_CHAIN_ID: chainId } = process.env;

export async function action(query?: EventsQuery): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};

  try {
    logger.info(`${name} start`);

    if (!chainId) {
      logger.error(`${name}: Missing EVENTS_CHAIN_ID`);

      return eventsProcessed;
    }

    const { networkName, bountyQuery } = query || {};

    if (!networkName && bountyQuery?.issueId) {
      logger.warn(`${name}: networkName is required when filtering by issueId`);

      return eventsProcessed;
    }

    const networks = await db.networks.findAll({
      where: {
        chain_id: +chainId,
        ... networkName ? { name: networkName } : {}
      },
      include: [
        {
          association: "issues",
          required: true,
          where: {
            state: "closed",
            ... bountyQuery?.issueId ? { issueId: bountyQuery.issueId } : {},
            fundingAmount: {
              [Op.and]: [
                { [Op.ne]: null },
                { [Op.ne]: "0" }
              ]
            }
          },
          include: [
            { 
              association: "benefactors",
              required: true,
              where: {
                withdrawn: false
              }
            }
          ]
        }
      ]
    });

    if (!networks || !networks.length) {
      logger.warn(`${name} found no networks`);
      return eventsProcessed;
    }

    const web3Connection = new Web3Connection({ web3Host, privateKey });
    await web3Connection.start();

    for (const  { name, networkAddress, issues } of networks) {
      const network = new Network_v2(web3Connection, networkAddress);
      
      await network.loadContract();

      for (const issue of issues) {
        const { issueId, contractId, benefactors } = issue;
        const { funding } = await network.getBounty(contractId!);

        for (const benefactor of benefactors) {
          if (funding[benefactor.contractId].amount === "0") {
            benefactor.withdrawn = true;
            await benefactor.save();
            logger.info(`${name} ${networkAddress} ${issueId} ${benefactor.address} reward withdrawn`);
          }
        }

        eventsProcessed[name!] = {
          ...eventsProcessed[name!],
          [issueId!]: { bounty: issue, eventBlock: null }
        };
      }
    }

  } catch (err: any) {
    logger.error(`${name} Error`, err?.message || err.toString());
  }

  return eventsProcessed;
}
