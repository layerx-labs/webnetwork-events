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
export const schedule = "*/5 * * * *"; // Every 5 minutes
export const description =
  "move to 'OPEN' all 'DRAFT' bounties that have Draft Time finished as set at the block chain";
export const author = "clarkjoao";

export default async function action(
  query?: EventsQuery
): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};

  try {
    logger.info("Starting move bounties to open");

    const service = new BlockChainService();
    await service.init(name);
    const networks = await service.getNetworks();

    for (const network of networks) {
      logger.info(`Bounties at ${network.name.toUpperCase()} network`);

      const bountiesProcessed: BountiesProcessed = {};

      if (
        !(await service.networkService.loadNetwork(network?.networkAddress))
      ) {
        logger.error(
          `Error at loading network networkService: ${network.networkAddress}`
        );
        continue;
      }

      const redeemTime = await service.networkService.network.draftTime();

      const where = {
        createdAt: { [Op.lt]: subMilliseconds(+new Date(), redeemTime) },
        network_id: network.id,
        state: "draft",
      };

      const bounties = await db.issues.findAll({
        where,
        include: [{ association: "token" }, { association: "repository" }],
      });

      if (!bounties) {
        logger.error(
          `${network.name.toUpperCase()} no have bounties to be moved`
        );
        continue;
      }
      const repositoriesDetails = {};

      for (const bounty of bounties) {
        logger.info(`Moving bounty ${bounty.issueId}`);

        const [owner, repo] = slashSplit(bounty?.repository?.githubPath);

        if (!repositoriesDetails[`${owner}/${repo}`]) {
          repositoriesDetails[`${owner}/${repo}`] =
            await GHService.repositoryDetails(repo, owner);
        }

        const labelId = repositoriesDetails[
          `${owner}/${repo}`
        ]?.repository?.labels?.nodes.find(
          (label) => label.name.toLowerCase() === "draft"
        )?.id;

        if (labelId) {
          const ghIssue = await GHService.issueDetails(
            repo,
            owner,
            bounty?.githubId as string
          );
          await GHService.issueRemoveLabel(
            ghIssue.repository.issue.id,
            labelId
          );
        }

        bounty.state = "open";
        await bounty.save();

        bountiesProcessed[bounty.issueId as string] = {
          bounty,
          eventBlock: null,
        };

        logger.info(`Bounty ${bounty.issueId} has moved to open`);
      }
      eventsProcessed[network.name as string] = bountiesProcessed;
    }
  } catch (err) {
    logger.error(`Error at try moving bounties: ${err}`);
  }

  return eventsProcessed;
}
