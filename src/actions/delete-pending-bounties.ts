import db from "src/db";

import {EventsProcessed, EventsQuery,} from "src/interfaces/block-chain-service";
import {Network_v2, Web3Connection} from "@taikai/dappkit";
import logger from "src/utils/logger-handler";
import {slashSplit} from "src/utils/string";
import GHService from "src/services/github";
import {subHours} from "date-fns";
import {Op} from "sequelize";

export const name = "deletePendingBounties";
export const schedule = "0 0 * * *";
export const description = "delete bounties pending and closed issue on github";
export const author = "MarcusviniciusLsantos";

const {
  NEXT_PUBLIC_WEB3_CONNECTION: web3Host,
  NEXT_WALLET_PRIVATE_KEY: privateKey,
  EVENTS_CHAIN_ID: chainId
} = process.env;


export async function action(query?: EventsQuery): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};


  logger.info(`${name} start`);

  try {
    const web3Connection = new Web3Connection({web3Host, privateKey});
    await web3Connection.start();

    const networks = await db.networks.findAll({
      where: { 
        isRegistered: true,
        chain_id: chainId
      },
      raw: true,
    });

    if (!networks || !networks.length) {
      logger.warn(`${name} found no networks`);
      return eventsProcessed;
    }

    for (const {networkAddress, id: network_id, name: networkName} of networks) {
      const _network = new Network_v2(web3Connection, networkAddress);
      await _network.loadContract();
      const pendingBounties = await db.issues.findAll({
        where: {
          state: "pending",
          network_id,
          createdAt: {[Op.lt]: subHours(+new Date(), 24)},
        },
        include: [{association: "repository"}],
      });

      logger.info(
        `${name} found ${pendingBounties?.length} pending bounties at ${networkName}`
      );

      if (!pendingBounties || !pendingBounties.length) continue;

      for (const dbBounty of pendingBounties) {
        if (dbBounty?.issueId) {
          const isBountyOnNetwork = await _network.cidBountyId(dbBounty.issueId)

          if (isBountyOnNetwork.toString() === '0' && dbBounty?.githubId) {
            logger.info(`${name} Removing pending bounty ${dbBounty.issueId}`);
  
            const [owner, repo] = slashSplit(dbBounty?.repository?.githubPath);
  
            await GHService.issueClose(repo, owner, dbBounty?.githubId)
  
            await dbBounty.destroy();
  
            eventsProcessed[networkName!] = {
              ...eventsProcessed[networkName!],
              [dbBounty.issueId!.toString()]: {
                bounty: dbBounty,
                eventBlock: null,
              },
            };
  
            logger.info(`${name} Removed pending bounty ${dbBounty.issueId}`);
          }
        }
      }
    }
  } catch (err: any) {
    logger.error(`${name} Error`, err?.message || err.toString());
  }

  return eventsProcessed;
}
