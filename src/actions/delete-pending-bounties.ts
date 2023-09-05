import db from "src/db";

import {EventsProcessed, EventsQuery,} from "src/interfaces/block-chain-service";
import {Network_v2, Web3Connection} from "@taikai/dappkit";
import logger from "src/utils/logger-handler";
import {subHours} from "date-fns";
import {Op} from "sequelize";
import {getChainsRegistryAndNetworks} from "../utils/block-process";

export const name = "deletePendingBounties";
export const schedule = "0 0 * * *";
export const description = "delete bounties pending and closed issue on github";
export const author = "MarcusviniciusLsantos";

const {NEXT_WALLET_PRIVATE_KEY: privateKey} = process.env;

export async function action(query?: EventsQuery): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};

  logger.info(`${name} start`);

  const entries = await getChainsRegistryAndNetworks();
  for (const [web3Host, {chainId: chain_id,}] of entries) {

    try {
      const web3Connection = new Web3Connection({web3Host, privateKey});
      await web3Connection.start();

      const networks = await db.networks.findAll({
        where: {
          isRegistered: true,
          chain_id
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
          }
        });

        logger.info(
          `${name} found ${pendingBounties?.length} pending bounties at ${networkName}`
        );

        if (!pendingBounties || !pendingBounties.length) continue;

        for (const dbBounty of pendingBounties) {
          const isBountyOnNetwork = await _network.cidBountyId(dbBounty.ipfsUrl!)

          if (isBountyOnNetwork.toString() === '0' && dbBounty?.githubId) {
            logger.info(`${name} Removing pending bounty ${dbBounty.id}`);

              await dbBounty.destroy();

            eventsProcessed[networkName!] = {
              ...eventsProcessed[networkName!],
              [dbBounty.id!.toString()]: {
                bounty: dbBounty,
                eventBlock: null,
              },
            };

            logger.info(`${name} Removed pending bounty ${dbBounty.id}`);
          }
        }
      }
    } catch (err: any) {
      logger.error(`${name} Error`, err?.message || err.toString());
    }

  }

  return eventsProcessed;
}
