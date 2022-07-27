import db from "../db/index.js";
import BlockChainService from "../services/block-chain-service.js";
import logger from "../utils/logger-handler.js";

export const name = "getBountyAmountUpdatedEvents";
export const schedule = "1 * * * * *";
export const description = "retrieving bounty created events";
export const author = "clarkjoao";

export async function action() {
  logger.info("retrieving bounty created events");

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

        const networkBounty = await service.DAO?.network?.getBounty(id);

        if (!networkBounty) {
          logger.error(`Bounty id: ${id} not found`);
          continue;
        }

        const bounty = await db.issues.findOne({
          where: {
            contractId: id,
            issueId: networkBounty?.cid,
            network_id: network?.id,
          },
        });

        if (!bounty) {
          logger.error(`Bounty cid: ${cid} not found`);
          continue;
        }

        bounty.amount = networkBounty.tokenAmount;
        await bounty.save();

        logger.info(`Bounty cid: ${networkBounty.cid} uodated`);
      }
    }
    await service.saveLastBlock();
  } catch (err) {
    logger.error(`Error update bounty amount:`, err);
  }
}
