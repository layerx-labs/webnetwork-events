import db from "src/db";
import logger from "src/utils/logger-handler";
import {ERC20, Network_v2, Web3Connection,} from "@taikai/dappkit";
import {EventsProcessed, EventsQuery,} from "src/interfaces/block-chain-service";
import {EventService} from "../services/event-service";
import {BountyCreatedEvent} from "@taikai/dappkit/dist/src/interfaces/events/network-v2-events";
import {DB_BOUNTY_NOT_FOUND, NETWORK_BOUNTY_NOT_FOUND} from "../utils/messages.const";
import {BlockProcessor} from "../interfaces/block-processor";

export const name = "getBountyCreatedEvents";
export const schedule = "*/10 * * * *";
export const description = "sync bounty data and move to 'DRAFT;";
export const author = "clarkjoao";

async function validateToken(connection: Web3Connection, address, isTransactional): Promise<number> {
  let token = await db.tokens.findOne({where: {address},});

  if (!token?.id) {
    const erc20 = new ERC20(connection, address);

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
  const service = new EventService(name, query);

  const processor: BlockProcessor<BountyCreatedEvent> = async (block, network) => {
    const {id, cid: issueId} = block.returnValues;

    const bounty = await (service.Actor as Network_v2).getBounty(+id);
    if (!bounty)
      return logger.error(NETWORK_BOUNTY_NOT_FOUND(name, id, network.networkAddress));

    const dbBounty = await db.issues.findOne({where: {issueId, network_id: network.id}});
    if (!dbBounty)
      return logger.error(DB_BOUNTY_NOT_FOUND(name, issueId, network.id));

    if (dbBounty.state !== "pending")
      return logger.info(`${name} Bounty ${issueId} was already parsed.`);

    dbBounty.state = "draft";
    dbBounty.creatorAddress = bounty.creator;
    dbBounty.creatorGithub = bounty.githubUser;
    dbBounty.amount = bounty.tokenAmount.toString();
    dbBounty.fundingAmount = bounty.fundingAmount.toString();
    dbBounty.branch = bounty.branch;
    dbBounty.title = bounty.title;
    dbBounty.contractId = +id;

    const tokenId = await validateToken(service.web3Connection, bounty.transactional, true);
    if (!tokenId)
      logger.info(`Failed to validate token ${bounty.transactional}`)
    else dbBounty.tokenId = tokenId;

    await dbBounty.save();

    eventsProcessed[network.name] = {...eventsProcessed[network.name], [dbBounty.issueId!.toString()]: {bounty: dbBounty, eventBlock: block}};

  }

  await service._processEvents(processor);


  return eventsProcessed;
}
