import db from "src/db";
import logger from "src/utils/logger-handler";
import {ERC20, Network_v2, Web3Connection,} from "@taikai/dappkit";
import {EventsProcessed, EventsQuery,} from "src/interfaces/block-chain-service";
import {EventService} from "../services/event-service";
import {BountyCreatedEvent} from "@taikai/dappkit/dist/src/interfaces/events/network-v2-events";
import {DB_BOUNTY_NOT_FOUND, NETWORK_BOUNTY_NOT_FOUND} from "../utils/messages.const";
import {BlockProcessor} from "../interfaces/block-processor";
import { updateLeaderboardBounties } from "src/modules/leaderboard";
import { updateBountiesHeader } from "src/modules/handle-header-information";
import {isZeroAddress} from "ethereumjs-util";
import {isAddress} from "web3-utils";

export const name = "getBountyCreatedEvents";
export const schedule = "*/10 * * * *";
export const description = "sync bounty data and move to 'DRAFT;";
export const author = "clarkjoao";

async function validateToken(connection: Web3Connection, address, isTransactional, chainId): Promise<number> {
  let token = await db.tokens.findOne({
    where: {
      address,
      chain_id: chainId
    }
  });

  if (!token?.id) {
    const erc20 = new ERC20(connection, address);

    await erc20.loadContract();

    token = await db.tokens.create({
      name: await erc20.name(),
      symbol: await erc20.symbol(),
      address, 
      isTransactional,
      isReward: !isTransactional
    });
  }

  return token.id;
}

export async function action(query?: EventsQuery): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};
  const service = new EventService(name, query);

  const processor: BlockProcessor<BountyCreatedEvent> = async (block, network) => {
    const {id, cid: issueId} = block.returnValues;

    const networkActor = service.Actor as Network_v2;

    const bounty = await networkActor.getBounty(+id);
    if (!bounty)
      return logger.warn(NETWORK_BOUNTY_NOT_FOUND(name, id, network.networkAddress));

    const dbBounty = await db.issues.findOne({where: {issueId, network_id: network.id}});
    if (!dbBounty)
      return logger.warn(DB_BOUNTY_NOT_FOUND(name, issueId, network.id));

    if (dbBounty.state !== "pending")
      return logger.warn(`${name} Bounty ${issueId} was already parsed.`);

    dbBounty.state = "draft";
    dbBounty.creatorAddress = bounty.creator;
    dbBounty.creatorGithub = bounty.githubUser;
    dbBounty.amount = bounty.tokenAmount.toString();
    dbBounty.fundingAmount = bounty.fundingAmount.toString();
    dbBounty.rewardAmount = bounty.rewardAmount.toString();
    dbBounty.branch = bounty.branch;
    dbBounty.title = bounty.title;
    dbBounty.contractId = +id;

    await validateToken(service.web3Connection, bounty.transactional, true, network.chainId)
      .then(id => dbBounty.transactionalTokenId = id)
      .catch(error => logger.warn(`Failed to validate token ${bounty.transactional}`, error.toString()));

    if (isAddress(bounty.rewardToken) && !isZeroAddress(bounty.rewardToken))
      await validateToken(service.web3Connection, bounty.rewardToken, false, network.chainId)
        .then(id => dbBounty.rewardTokenId = id)
        .catch(error => logger.warn(`Failed to validate token ${bounty.rewardToken}`, error.toString()));

    await dbBounty.save();

    await updateLeaderboardBounties();
    await updateBountiesHeader()

    eventsProcessed[network.name] = {...eventsProcessed[network.name], [dbBounty.issueId!.toString()]: {bounty: dbBounty, eventBlock: block}};
  }

  await service._processEvents(processor);

  return eventsProcessed;
}
