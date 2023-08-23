import db from "src/db";
import logger from "src/utils/logger-handler";
import {Op} from "sequelize";
import {EventsProcessed, EventsQuery,} from "src/interfaces/block-chain-service";
import {Network_v2, Web3Connection} from "@taikai/dappkit";
import {getChainsRegistryAndNetworks} from "../utils/block-process";

export const name = "get-bounty-reward-withdraw";
export const schedule = "*/1 * * * *";
export const description = "get withdrawn rewards";
export const author = "Vitor Hugo";

const {NEXT_WALLET_PRIVATE_KEY: privateKey} = process.env;

export async function action(query?: EventsQuery): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};

  const validAmont = {
    [Op.and]: [
      {[Op.ne]: null},
      {[Op.ne]: "0"}
    ]
  };

  const entries = await getChainsRegistryAndNetworks();
  for (const [web3Host, {chainId: chain_id,}] of entries) {
    try {
      logger.info(`${name} start`);

      if (!chain_id) {
        logger.error(`${name}: Missing EVENTS_CHAIN_ID`);

        return eventsProcessed;
      }

      const {networkName, bountyQuery} = query || {};

      if (!networkName && bountyQuery?.issueId) {
        logger.warn(`${name}: networkName is required when filtering by issueId`);

        return eventsProcessed;
      }

      const networks = await db.networks.findAll({
        where: {
          chain_id,
          ...networkName ? {name: networkName} : {}
        },
        include: [
          {
            association: "issues",
            required: true,
            where: {
              state: "closed",
              ...bountyQuery?.issueId ? {id: bountyQuery.issueId} : {},
              fundingAmount: validAmont,
              rewardAmount: validAmont
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

      const web3Connection = new Web3Connection({web3Host, privateKey});
      await web3Connection.start();

      for (const {name, networkAddress, issues} of networks) {
        const network = new Network_v2(web3Connection, networkAddress);

        await network.loadContract();

        for (const issue of issues) {
          const {id, contractId, benefactors} = issue;
          const {funding} = await network.getBounty(contractId!);

          for (const benefactor of benefactors) {
            if (funding[benefactor.contractId].amount === "0") {
              benefactor.withdrawn = true;
              await benefactor.save();
              logger.info(`${name} ${networkAddress} ${id} ${benefactor.address} reward withdrawn`);
            }
          }

          eventsProcessed[name!] = {
            ...eventsProcessed[name!],
            [id.toString()]: {bounty: issue, eventBlock: null}
          };
        }
      }

    } catch (err: any) {
      logger.error(`${name} Error`, err?.message || err.toString());
    }
  }

  return eventsProcessed;
}
