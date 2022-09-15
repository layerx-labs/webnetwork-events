import { subMilliseconds } from "date-fns";
import { Op } from "sequelize";
import db from "src/db";
import {
  BountiesProcessed,
  EventsProcessed,
  EventsQuery,
} from "src/interfaces/block-chain-service";
import BlockChainService from "src/services/block-chain-service";
import GHService from "src/services/github";
import logger from "src/utils/logger-handler";
import { slashSplit } from "src/utils/string";


export const name = "get-bounty-moved-to-open";
export const schedule = "*/5 * * * *";
export const description =
  "move to 'OPEN' all 'DRAFT' bounties that have Draft Time finished as set at the block chain";
export const author = "clarkjoao";

export async function action(query?: EventsQuery): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};

  try {

    logger.info(`${name} start`);

    const service = new BlockChainService();

    await service.init(name);

    for (const network of await service.getNetworks()) {
      logger.info(`${name} listing bounties for ${network.networkAddress}`);

      if (!(await service.networkService.loadNetwork(network?.networkAddress))) {
        logger.error(`${name} Failed to load network ${network.networkAddress}`, network);
        continue;
      }

      const redeemTime = await service.networkService.network.draftTime();

      const bounties = await db.issues.findAll({
        where: {
          createdAt: { [Op.lt]: subMilliseconds(+new Date(), redeemTime) },
          network_id: network.id,
          state: "draft",},
        include: [{ association: "token" }, { association: "repository" }],
      });

      logger.info(`Found ${bounties.length} draft bounties on ${network.networkAddress}`);

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

        eventsProcessed[network.name] = {...eventsProcessed[network.name], [dbBounty.issueId!.toString()]: {bounty: dbBounty, eventBlock: null}};

        logger.info(`${name} Parsed bounty ${dbBounty.issueId}`);
      }

      logger.info(`${name} finished`)
    }
  } catch (err) {
    logger.error(`${name} Error`, err);
  }

  return eventsProcessed;
}
