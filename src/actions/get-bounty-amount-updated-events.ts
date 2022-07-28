import db from "src/db";
import BlockChainService from "src/services/block-chain-service";
import logger from "src/utils/logger-handler";

export const name = "getBountyAmountUpdatedEvents";
export const schedule = "1 * * * * *";
export const description = "retrieving bounty created events";
export const author = "clarkjoao";

export async function action() {
  const bountyUpdatedAmount: any[] = [];

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
          logger.error(`Bounty cid: ${networkBounty.cid} not found`);
          continue;
        }

        bounty.amount = networkBounty.tokenAmount;
        await bounty.save();

        bountyUpdatedAmount.push({ bounty, networkBounty });

        logger.info(`Bounty cid: ${networkBounty.cid} updated`);
      }
    }
    await service.saveLastBlock();
  } catch (err) {
    logger.error(`Error update bounty amount:`, err);
  }

  return bountyUpdatedAmount;
}

export default action;
