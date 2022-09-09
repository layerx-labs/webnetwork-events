import { ERC20 } from "@taikai/dappkit";
import db from "src/db";
import {
  BountiesProcessed,
  EventsProcessed,
  EventsQuery,
} from "src/interfaces/block-chain-service";
import BlockChainService from "src/services/block-chain-service";
import NetworkService from "src/services/network-service";
import logger from "src/utils/logger-handler";

export const name = "getBountyCreatedEvents";
export const schedule = "*/10 * * * *"; // Each 10 minuts
export const description = "sync bounty data and move to 'DRAFT;";
export const author = "clarkjoao";

async function validateToken(
  networkService: NetworkService,
  transactionalToken
): Promise<number> {
  var token = await db.tokens.findOne({
    where: {
      address: transactionalToken,
    },
  });

  if (!token?.id) {
    const erc20 = new ERC20(
      networkService?.network?.connection,
      transactionalToken
    );

    await erc20.loadContract();

    token = await db.tokens.create({
      name: await erc20.name(),
      symbol: await erc20.symbol(),
      address: transactionalToken,
      isTransactional: true
    });
  }

  return token.id;
}

export default async function action(
  query?: EventsQuery
): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};

  try {
    logger.info("retrieving bounty created events");

    const service = new BlockChainService();
    await service.init(name);

    const events = await service.getEvents(query);

    logger.info(`found ${events.length} events`);
    for (let event of events) {
      const { network, eventsOnBlock } = event;

      const bountiesProcessed: BountiesProcessed = {};

      if (!(await service.networkService.loadNetwork(network.networkAddress))) {
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

        const networkBounty = await service.networkService?.network?.getBounty(
          id
        );

        if (networkBounty) {
          bounty.creatorAddress = networkBounty.creator;
          bounty.creatorGithub = networkBounty.githubUser;
          bounty.amount = +networkBounty.tokenAmount;
          bounty.fundingAmount = +networkBounty.fundingAmount;
          bounty.branch = networkBounty.branch;
          bounty.title = networkBounty.title;
          bounty.contractId = id;

          const tokeId = await validateToken(
            service.networkService,
            networkBounty.transactional
          );

          if (tokeId) bounty.tokenId = tokeId;
        }
        await bounty.save();

        bountiesProcessed[bounty.issueId as string] = { bounty, eventBlock };

        logger.info(`Bounty cid: ${cid} created`);
      }
      eventsProcessed[network.name as string] = bountiesProcessed;
    }
    if (!query) await service.saveLastBlock();
  } catch (err) {
    logger.error(`Error ${name}:`, err);
  }
  return eventsProcessed;
}
