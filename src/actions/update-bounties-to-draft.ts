import db from "src/db";
import logger from "src/utils/logger-handler";
import loggerHandler from "src/utils/logger-handler";
import {EventsProcessed, EventsQuery,} from "src/interfaces/block-chain-service";
import {Network_v2, Web3Connection} from "@taikai/dappkit";
import {slashSplit} from "src/utils/string";
import GHService from "src/services/github";
import {isAfter, subMilliseconds} from "date-fns";
import {getChainsRegistryAndNetworks} from "../utils/block-process";
import {sendMessageToTelegramChannels} from "../integrations/telegram";
import {BOUNTY_STATE_CHANGED} from "../integrations/telegram/messages";
import { Op } from "sequelize";

export const name = "updateBountiesToDraft";
export const schedule = "0 2 * * *" // every 2 AM
export const description = "when draft time has been change at contract, we must update opened bounties to draft again";
export const author = "clarkjoao";

const {
  NEXT_PUBLIC_WEB3_CONNECTION: web3Host,
  NEXT_WALLET_PRIVATE_KEY: privateKey,
  EVENTS_CHAIN_ID: chainId
} = process.env;

export async function action(query?: EventsQuery): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};

  logger.info(`${name} start`);

  const entries = await getChainsRegistryAndNetworks();
  for (const [web3Host, {chainId: chain_id,}] of entries) {
    const where = {
      chain_id,
      isRegistered: true,
      ...query?.networkName ? {name: {[Op.iLike]: query.networkName.replaceAll(/\s/gi, '-')}} : {},
    }

    try {
      const web3Connection = new Web3Connection({web3Host, privateKey});
      await web3Connection.start();

      const networks = await db.networks.findAll({where, raw: true});

      if (!networks || !networks.length) {
        loggerHandler.warn(`${name} found no networks`);
        return eventsProcessed;
      }

      for (const {networkAddress, id: network_id, name: networkName} of networks) {
        const _network = new Network_v2(web3Connection, networkAddress);
        await _network.loadContract();

        const bounties = await db.issues.findAll({
          where: {
            state: "open",
            network_id,
          },
          include: [
            {association: "repository",},
            {association: "deliverables",},
            {association: "network",},
          ],
        });

        loggerHandler.info(`${name} found ${bounties?.length} opened bounties at ${networkName}`);

        const repositoriesDetails = {};

        const draftTime = await _network.draftTime()
        const timeOnChain = await web3Connection.Web3.eth.getBlock(`latest`).then(({timestamp}) => +timestamp * 1000);

        for (const dbBounty of bounties) {

          if (dbBounty.deliverables.length)
            continue;

          const networkBounty = await _network.cidBountyId(`${dbBounty?.issueId}`).then(id => _network.getBounty(+id));

          if (isAfter(subMilliseconds(timeOnChain, draftTime), networkBounty.creationDate))
            continue;

          const [owner, repo] = slashSplit(dbBounty?.repository?.githubPath);
          const detailKey = `${owner}/${repo}`;

          if (!repositoriesDetails[detailKey])
            repositoriesDetails[detailKey] =
              await GHService.repositoryDetails(repo, owner);

          const labelId = repositoriesDetails[detailKey]
            .repository.labels.nodes.find((label) => label.name.toLowerCase() === "draft")?.id;

          if (labelId) {
            const ghIssue = await GHService.issueDetails(repo, owner, dbBounty?.githubId as string);
            await GHService.issueAddLabel(ghIssue.repository.issue.id, labelId);
          }

          dbBounty.state = "draft";
          await dbBounty.save();
          sendMessageToTelegramChannels(BOUNTY_STATE_CHANGED(dbBounty.state, dbBounty));
          eventsProcessed[networkName!] = {
            ...eventsProcessed[networkName!],
            [dbBounty.issueId!.toString()]: {bounty: dbBounty, eventBlock: null}
          };

          logger.info(`${name} Parsed bounty ${dbBounty.issueId}`);
        }
      }

    } catch (err: any) {
      logger.error(`${name} Error`, err?.message || err.toString());
    }
  }

  return eventsProcessed;
}
