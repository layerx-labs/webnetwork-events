import { subMilliseconds } from "date-fns";
import { Op } from "sequelize";
import db from "src/db";
import {
  BountiesProcessed,
  BountiesProcessedPerNetwork,
  EventsQuery,
} from "src/interfaces/block-chain-service";
import BlockChainService from "src/services/block-chain-service";
import GHService from "src/services/github";
import logger from "src/utils/logger-handler";
import { slashSplit } from "src/utils/string";

export const name = "get-bounty-moved-to-open";
export const schedule = "1 * * * * *";
export const description = "moving draft bounties to open";
export const author = "clarkjoao";

export default async function action(
  query?: EventsQuery
): Promise<BountiesProcessedPerNetwork[]> {
  const bountiesProcessedPerNetwork: BountiesProcessedPerNetwork[] = [];

  logger.info("Starting move bounties to open");

  const service = new BlockChainService();
  await service.init(name);
  const networks = await service.getNetworks();
  try {
    for (const network of networks) {
      logger.info(`Moving bounties to open for network ${network.name}`);

      const bountiesProcessed: BountiesProcessed[] = [];

      if (
        !(await service.networkService.loadNetwork(network?.networkAddress))
      ) {
        logger.error(`Error loading network networkService ${network.name}`);
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
        logger.error(`No issues found for network ${network.name}`);
        continue;
      }
      const repositoriesDetails = {};

      for (const bonty of bounties) {
        logger.info(`Moving issue ${bonty.id} to open`);

        const [owner, repo] = slashSplit(bonty?.repository?.githubPath);

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
            bonty?.githubId as string
          );
          await GHService.issueRemoveLabel(
            ghIssue.repository.issue.id,
            labelId
          );
        }

        bonty.state = "open";
        await bonty.save();
        bountiesProcessed.push({ bounty: bonty, eventBlock: null });
        logger.info(`Issue ${bonty.id} moved to open`);
      }
      bountiesProcessedPerNetwork.push({ network, bountiesProcessed });
    }
  } catch (err) {
    logger.error(`Error moving bounties: ${err}`);
  }

  return bountiesProcessedPerNetwork;
}
