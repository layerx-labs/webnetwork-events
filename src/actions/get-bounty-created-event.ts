import { ERC20 } from "@taikai/dappkit";
import db from "src/db";
import { EventsQuery } from "src/interfaces/block-chain-service";
import BlockChainService from "src/services/block-chain-service";
import logger from "src/utils/logger-handler";
import { BountiesProcessed } from "./../interfaces/block-chain-service";

export const name = "getBountyCreatedEvents";
export const schedule = "1 * * * * *";
export const description = "retrieving bounty created events";
export const author = "clarkjoao";

async function validateToken(DAO, transactionalToken): Promise<number> {
  var token = await db.tokens.findOne({
    where: {
      address: transactionalToken,
    },
  });

  if (!token?.id) {
    const erc20 = new ERC20(DAO?.network?.connection, transactionalToken);

    await erc20.loadContract();

    token = await db.tokens.create({
      name: await erc20.name(),
      symbol: await erc20.symbol(),
      address: transactionalToken,
    });
  }

  return token.id;
}

export async function getBountyCreatedEvents(
  query?: EventsQuery
): Promise<BountiesProcessed[]> {
  const bountiesProcessed: BountiesProcessed[] = [];
  logger.info("retrieving bounty created events");

  const service = new BlockChainService();
  await service.init(name);

  const events = await service.getEvents(query);

  logger.info(`found ${events.length} events`);

  try {
    for (let event of events) {
      const { network, eventsOnBlock } = event;

      if (!(await service.DAO.loadNetwork(network.networkAddress))) {
        logger.error(`Error loading network contract ${network.name}`);
        continue;
      }

      for (let eventBlock of eventsOnBlock) {
        const { id, cid } = eventBlock.returnValues;

        const bounty = await db.issues.findOne({
          where: {
            issueId: cid,
            network_id: network?.id,
          },
        });

        if (!bounty) {
          logger.info(`Bounty cid: ${cid} not found`);
          continue;
        }

        if (bounty.state !== "pending") {
          logger.info(`Bounty cid: ${cid} already in draft state`);
          continue;
        }

        bounty.state = "draft";

        const networkBounty = await service.DAO?.network?.getBounty(id);

        if (networkBounty) {
          bounty.creatorAddress = networkBounty.creator;
          bounty.creatorGithub = networkBounty.githubUser;
          bounty.amount = networkBounty.tokenAmount;
          bounty.branch = networkBounty.branch;
          bounty.title = networkBounty.title;
          bounty.contractId = id;

          const tokeId = await validateToken(
            service.DAO,
            networkBounty.transactional
          );

          if (tokeId) bounty.tokenId = tokeId;
        }
        await bounty.save();

        bountiesProcessed.push({ bounty, networkBounty });

        logger.info(`Bounty cid: ${cid} created`);
      }
    }
    if (!query) await service.saveLastBlock();
  } catch (err) {
    logger.error(`Error ${name}:`, err);
  }
  return bountiesProcessed;
}

export const action = getBountyCreatedEvents;

export default action;