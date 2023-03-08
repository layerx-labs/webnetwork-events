import db from "src/db";
import logger from "src/utils/logger-handler";
import {ERC20, Web3Connection,} from "@taikai/dappkit";
import {EventsProcessed, EventsQuery,} from "src/interfaces/block-chain-service";
import {DB_BOUNTY_NOT_FOUND} from "../utils/messages.const";
import {updateLeaderboardBounties} from "src/modules/leaderboard";
import {updateBountiesHeader} from "src/modules/handle-header-information";
import {isZeroAddress} from "ethereumjs-util";
import {isAddress} from "web3-utils";
import {DecodedLog} from "../interfaces/block-sniffer";
import {getBountyFromChain, getNetwork} from "../utils/block-process";
import {BountyCreatedEvent} from "@taikai/dappkit/dist/src/interfaces/events/network-v2-events";

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

export async function action(block: DecodedLog<BountyCreatedEvent['returnValues']>, query?: EventsQuery): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};
  const {returnValues: {id, cid: issueId}, connection, address, chainId} = block;

  const bounty = await getBountyFromChain(connection, address, id, name);
  if (!bounty)
    return eventsProcessed;

  const network = await getNetwork(chainId, address);
  if (!network)
    return eventsProcessed;

  const dbBounty = await db.issues.findOne({where: {issueId, network_id: network.id}});
  if (!dbBounty) {
    logger.warn(DB_BOUNTY_NOT_FOUND(name, issueId, network.id));
    return eventsProcessed
  }

  if (dbBounty.state !== "pending") {
    logger.warn(`${name} Bounty ${issueId} was already parsed.`)
    return eventsProcessed;
  }


  dbBounty.state = "draft";
  dbBounty.creatorAddress = bounty.creator;
  dbBounty.creatorGithub = bounty.githubUser;
  dbBounty.amount = bounty.tokenAmount.toString();
  dbBounty.fundingAmount = bounty.fundingAmount.toString();
  dbBounty.rewardAmount = bounty.rewardAmount.toString();
  dbBounty.branch = bounty.branch;
  dbBounty.title = bounty.title;
  dbBounty.contractId = +id;

  await validateToken(connection, bounty.transactional, true, chainId)
    .then(id => dbBounty.transactionalTokenId = id)
    .catch(error => logger.warn(`Failed to validate token ${bounty.transactional}`, error.toString()));

  if (isAddress(bounty.rewardToken) && !isZeroAddress(bounty.rewardToken))
    await validateToken(connection, bounty.rewardToken, false, chainId)
      .then(id => dbBounty.rewardTokenId = id)
      .catch(error => logger.warn(`Failed to validate token ${bounty.rewardToken}`, error.toString()));

  await dbBounty.save();

  await updateLeaderboardBounties();
  await updateBountiesHeader()

  eventsProcessed[network.name!] = {
    ...eventsProcessed[network.name!],
    [dbBounty.issueId!.toString()]: {bounty: dbBounty, eventBlock: block}
  };

  return eventsProcessed;
}
