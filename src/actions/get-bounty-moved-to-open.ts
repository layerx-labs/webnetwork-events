import db from "src/db";
import GHService from "src/services/github";
import logger from "src/utils/logger-handler";
import loggerHandler from "src/utils/logger-handler";
import { subMilliseconds } from "date-fns";
import { Op } from "sequelize";
import {EventsProcessed, EventsQuery,} from "src/interfaces/block-chain-service";
import { slashSplit } from "src/utils/string";
import {Network_v2, Web3Connection} from "@taikai/dappkit";


export const name = "get-bounty-moved-to-open";
export const schedule = "*/5 * * * *";
export const description =
  "move to 'OPEN' all 'DRAFT' bounties that have Draft Time finished as set at the block chain";
export const author = "clarkjoao";

const {NEXT_PUBLIC_WEB3_CONNECTION: web3Host, NEXT_WALLET_PRIVATE_KEY: privateKey,} = process.env;

export async function action(query?: EventsQuery): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};

  try {

    logger.info(`${name} start`);

    const web3Connection = new Web3Connection({web3Host, privateKey});
    await web3Connection.start();

    const networks = await db.networks.findAll({where: {isRegistered: true}, raw: true});
    if (!networks || !networks.length) {
      loggerHandler.warn(`${name} found no networks`);
      return eventsProcessed;
    }

    for (const {networkAddress, id: network_id, name: networkName} of networks) {
      const _network = new Network_v2(web3Connection, networkAddress);
      await _network.loadContract();
      const draftTime = await _network.draftTime();
      const bounties =
        await db.issues.findAll({
          where: {
            createdAt: {[Op.lt]: subMilliseconds(+new Date(), draftTime)},
            network_id,
            state: "draft"
          }
        });

      loggerHandler.info(`${name} found ${bounties.length} draft bounties on ${networkAddress}`);

      if (!bounties || !bounties.length)
        continue;

      const repositoriesDetails = {};

      for (const dbBounty of bounties) {
        logger.info(`${name} Parsing bounty ${dbBounty.issueId}`);

        const [owner, repo] = slashSplit(dbBounty?.repository?.githubPath);
        const detailKey = `${owner}/${repo}`;

        if (!repositoriesDetails[detailKey])
          repositoriesDetails[detailKey] =
            await GHService.repositoryDetails(repo, owner);

        const labelId = repositoriesDetails[detailKey]
          .repository.labels.nodes.find((label) => label.name.toLowerCase() === "draft")?.id;

        if (labelId) {
          const ghIssue = await GHService.issueDetails(repo, owner, dbBounty?.githubId as string);
          await GHService.issueRemoveLabel(ghIssue.repository.issue.id, labelId);
        }

        dbBounty.state = "open";
        await dbBounty.save();

        eventsProcessed[networkName] = {
          ...eventsProcessed[networkName],
          [dbBounty.issueId!.toString()]: {bounty: dbBounty, eventBlock: null}
        };

        logger.info(`${name} Parsed bounty ${dbBounty.issueId}`);

      }
    }

  } catch (err) {
    logger.error(`${name} Error`, err);
  }

  return eventsProcessed;
}
