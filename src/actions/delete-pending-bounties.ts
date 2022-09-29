import db from "src/db";
import logger from "src/utils/logger-handler";
import {
  EventsProcessed,
  EventsQuery,
} from "src/interfaces/block-chain-service";
import { Network_v2, Web3Connection } from "@taikai/dappkit";
import loggerHandler from "src/utils/logger-handler";
import { slashSplit } from "src/utils/string";
import GHService from "src/services/github";

export const name = "deletePendingBounties";
export const schedule = "*/1 * * * *";
export const description = "delete bounties pending and closed issue on github";
export const author = "MarcusviniciusLsantos";

const {
  NEXT_PUBLIC_WEB3_CONNECTION: web3Host,
  NEXT_WALLET_PRIVATE_KEY: privateKey,
} = process.env;

export async function action(query?: EventsQuery): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};

  logger.info(`${name} start`);

  try {
    const web3Connection = new Web3Connection({ web3Host, privateKey });
    await web3Connection.start();

    const networks = await db.networks.findAll({
      where: { isRegistered: true },
      raw: true,
    });
    if (!networks || !networks.length) {
      loggerHandler.warn(`${name} found no networks`);
      return eventsProcessed;
    }

    for (const { networkAddress, id: network_id, name: networkName } of networks) {
      const _network = new Network_v2(web3Connection, networkAddress);
      await _network.loadContract();
      const numberNetworkIssues = await _network.bountiesIndex();
      const pendingBounties = await db.issues.findAll({
        where: { state: "pending", network_id },
        include: [{ association: "repository" }]
      });

      if (!pendingBounties || !pendingBounties.length) continue;

      loggerHandler.info(
        `${name} found ${pendingBounties?.length} pending bounties at ${networkName}`
      );

      const cidBounties: string[] = await Promise.all(
        [...Array(numberNetworkIssues).keys()].map(async (id) => {
          return await _network.getBounty(id).then((bounty) => bounty.cid);
        })
      );

      for (const dbBounty of pendingBounties) {

        const isBountyOnNetwork = cidBounties.find(
          (cid) => cid === dbBounty.issueId
        );

        if (!isBountyOnNetwork && dbBounty?.githubId) {

          logger.info(`${name} Removing pending bounty ${dbBounty.issueId}`);

          const [owner, repo] = slashSplit(dbBounty.repository?.githubPath);

          await GHService.issueClose(repo, owner, dbBounty?.githubId)
            .catch(e => logger.error(`${name} Failed to close ${owner}/${repo}/issues/${dbBounty.githubId}`, e));

          await dbBounty.destroy();

          eventsProcessed[networkName] = {
            ...eventsProcessed[networkName],
            [dbBounty.issueId!.toString()]: {
              bounty: dbBounty,
              eventBlock: null,
            },
          };

          logger.info(`${name} Removed pending bounty ${dbBounty.issueId}`);
        }
      }
    }
  } catch (err) {
    logger.error(`${name} Error`, err);
  }

  return eventsProcessed;
}
