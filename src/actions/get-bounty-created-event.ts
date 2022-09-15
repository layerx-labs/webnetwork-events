import db from "src/db";
import logger from "src/utils/logger-handler";
import NetworkService from "src/services/network-service";
import {ERC20, XEvents} from "@taikai/dappkit";
import {EventsProcessed, EventsQuery,} from "src/interfaces/block-chain-service";
import {EventService} from "../services/event-service";
import {BountyCreatedEvent} from "@taikai/dappkit/dist/src/interfaces/events/network-v2-events";
import {DB_BOUNTY_NOT_FOUND, NETWORK_BOUNTY_NOT_FOUND} from "../utils/messages.const";

export const name = "getBountyCreatedEvents";
export const schedule = "*/10 * * * *";
export const description = "sync bounty data and move to 'DRAFT;";
export const author = "clarkjoao";

async function validateToken(networkService: NetworkService, address, isTransactional): Promise<number> {
  let token = await db.tokens.findOne({where: {address},});

  if (!token?.id) {
    const erc20 = new ERC20(
      networkService?.network?.connection,
      address
    );

    await erc20.loadContract();

    token = await db.tokens.create({
      name: await erc20.name(),
      symbol: await erc20.symbol(),
      address, isTransactional
    });
  }

  return token.id;
}

export async function action(query?: EventsQuery): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};

  try {

    const service = new EventService(name, query);

    const processor = async (block: XEvents<BountyCreatedEvent>, network) => {
      const {id, cid: issueId} = block.returnValues;

      const {chainService:{networkService}} = service;
      const {network:{getBounty}} = networkService;

      const bounty = await getBounty(id);
      if (!bounty)
        return logger.error(NETWORK_BOUNTY_NOT_FOUND(id, network.networkAddress));

      const dbBounty = await db.issues.findOne({where: {issueId, network_id: network.id}});
      if (!dbBounty)
        return logger.error(DB_BOUNTY_NOT_FOUND(issueId, network.id));

      if (dbBounty.state !== "pending")
        return logger.info(`Bounty ${issueId} was already parsed.`);

      dbBounty.state = "draft";
      dbBounty.creatorAddress = bounty.creator;
      dbBounty.creatorGithub = bounty.githubUser;
      dbBounty.amount = +bounty.tokenAmount;
      dbBounty.fundingAmount = +bounty.fundingAmount;
      dbBounty.branch = bounty.branch;
      dbBounty.title = bounty.title;
      dbBounty.contractId = id;

      const tokenId = await validateToken(networkService, bounty.transactional, true);
      if (!tokenId)
        logger.info(`Failed to validate token ${bounty.transactional}`)
      else dbBounty.tokenId = tokenId;

      await dbBounty.save();

      eventsProcessed[network.name] = {...eventsProcessed[network.name], [dbBounty.issueId!.toString()]: {bounty: dbBounty, eventBlock: block}};

    }

    await service.processEvents<BountyCreatedEvent>(processor);

  } catch (err) {
    logger.error(`Error ${name}:`, err);
  }
  return eventsProcessed;
}
