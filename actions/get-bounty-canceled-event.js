import db from "../db/index.js";
import BlockChainService from "../services/block-chain-service.js";
import GHService from "../services/github/index.js";
import logger from "../utils/logger-handler.js";
import { ghPathSplit } from "../utils/string.js";

export const name = "getBountyCanceledEvents";
export const schedule = "1 * * * * *";
export const description = "retrieving bounty canceled events";
export const author = "clarkjoao";

export async function action() {
  logger.info("retrieving bounty canceled events");

  const service = new BlockChainService();
  await service.init(name);

  const events = await service.getAllEvents();

  logger.info(`found ${events.length} events`);

  try {
    for (let event of events) {
      const { network, eventsOnBlock } = event;

      if (!(await service.DAO.loadNetwork(network.networkAddress))) {
        logger.error(`Error loading network contract ${network.name}`);
        continue;
      }

      for (let eventBlock of eventsOnBlock) {
        const { id } = eventBlock.returnValues;

        const networkBounty = await service?.DAO?.network?.getBounty(id);

        if (!networkBounty) {
          logger.error(`Bounty id: ${id} not found`);
          continue;
        }

        const bounty = await db.issues.findOne({
          where: {
            contractId: id,
            issueId: networkBounty.cid,
            network_id: network.id,
          },
          include: [{ association: "token", association: "repository" }],
        });

        if (!bounty) {
          logger.error(`Bounty cid: ${networkBounty.cid} not found`);
          continue;
        }

        if (bounty.state !== "draft") {
          logger.error(
            `Bounty cid: ${networkBounty.cid} already in draft state`
          );
          continue;
        }

        const [owner, repo] = ghPathSplit(bounty?.repository?.githubPath);

        await GHService.issueClose(repo, owner, bounty?.issueId);

        bounty.state = "canceled";

        await bounty.save();

        //TODO: must post a new twitter card;
        logger.info(`Bounty cid: ${networkBounty.cid} canceled`);
      }
    }
    await service.saveLastBlock();
  } catch (err) {
    logger.error(`Error ${name}: `, err);
  }
}
