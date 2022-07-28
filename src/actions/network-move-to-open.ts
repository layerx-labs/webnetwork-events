import { subMilliseconds } from "date-fns";
import { Op } from "sequelize";
import { networksAttributes as NetworkProps } from "src/db/models/networks";
import db from "src/db";
import DAOService from "src/services/dao-service";
import GHService from "src/services/github";
import logger from "src/utils/logger-handler";
import { ghPathSplit } from "src/utils/string";

export const name = "move-bounties-to-open";
export const schedule = "1 * * * * *";
export const description = "moving draft bounties to open";
export const author = "clarkjoao";

async function loadIssues(network: NetworkProps, DAO: DAOService) {
  const redeemTime = await DAO.network.draftTime();

  const where = {
    createdAt: { [Op.lt]: subMilliseconds(+new Date(), redeemTime) },
    network_id: network.id,
    state: "draft",
  };

  const issues = await db.issues.findAll({
    where,
    include: [{ association: "token" }, { association: "repository" }],
  });

  if (!issues) {
    logger.error(`No issues found for network ${network.name}`);
    return;
  }
  const repositoriesDetails = {};

  for (const issue of issues) {
    logger.info(`Moving issue ${issue.id} to open`);

    try {
      const [owner, repo] = ghPathSplit(issue?.repository?.githubPath);

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
          issue?.githubId || ""
        );
        await GHService.issueRemoveLabel(ghIssue.repository.issue.id, labelId);
      }

      issue.state = "open";
      await issue.save();
      logger.info(`Issue ${issue.id} moved to open`);
    } catch (err) {
      logger.error(`Error moving issue ${issue.id}: ${err}`);
    }
  }

  return issues;
}

export async function action() {
  logger.info("Starting move bounties to open");

  const networks: NetworkProps[] = await db.networks.findAll();
  const DAO = new DAOService();

  const bountysPerNetworks: any = [];

  for (const network of networks) {
    logger.info(`Moving bounties to open for network ${network.name}`);

    if (!(await DAO.loadNetwork(network?.networkAddress))) {
      logger.error(`Error loading network DAO ${network.name}`);
      continue;
    }

    const bountys = await loadIssues(network, DAO);
    bountysPerNetworks.push({ network, bountys });
  }

  return bountysPerNetworks;
}

export default action;
