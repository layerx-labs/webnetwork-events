import db from "src/db";
import logger from "src/utils/logger-handler";
import {ERC20, Web3Connection,} from "@taikai/dappkit";
import {EventsProcessed, EventsQuery,} from "src/interfaces/block-chain-service";
import {DB_BOUNTY_NOT_FOUND, NETWORK_NOT_FOUND} from "../utils/messages.const";
import {updateLeaderboardBounties} from "src/modules/leaderboard";
import {updateBountiesHeader} from "src/modules/handle-header-information";
import {sendMessageToTelegramChannels} from "../integrations/telegram";
import {NEW_BOUNTY_OPEN} from "../integrations/telegram/messages";
import {isZeroAddress} from "ethereumjs-util";
import {isAddress} from "web3-utils";
import {DecodedLog} from "../interfaces/block-sniffer";
import {getBountyFromChain, getNetwork, parseLogWithContext} from "../utils/block-process";
import {BountyCreatedEvent} from "@taikai/dappkit/dist/src/interfaces/events/network-v2-events";

import {Sequelize, WhereOptions} from "sequelize";
import generateCard from "src/modules/generate-bounty-cards";
import ipfsService from "src/services/ipfs-service";
import {tokens} from "src/db/models/tokens";
import {isIpfsEnvs} from "src/utils/ipfs-envs-verify";
import {Push} from "../services/analytics/push";
import {AnalyticEventName} from "../services/analytics/types/events";
import { getDeveloperAmount } from "src/modules/calculate-distributed-amounts";
import { getCoinIconByChainAndContractAddress } from "src/services/coingecko";


export const name = "getBountyCreatedEvents";
export const schedule = "*/10 * * * *";
export const description = "sync bounty data and move to 'DRAFT;";
export const author = "clarkjoao";

async function validateToken(connection: Web3Connection, address, isTransactional, chainId): Promise<tokens> {
  let token = await db.tokens.findOne({
    where: {
      address: Sequelize.where(Sequelize.fn("LOWER", Sequelize.col("tokens.address")), 
                              "=",
                              address.toString().toLowerCase()),
      chain_id: chainId
    } as WhereOptions
  });

  if (!token?.id) {
    const erc20 = new ERC20(connection, address);

    await erc20.loadContract();

    const icon = await getCoinIconByChainAndContractAddress(address, +chainId) || undefined

    token = await db.tokens.create({
      name: await erc20.name(),
      symbol: await erc20.symbol(),
      address,
      isTransactional,
      isReward: !isTransactional,
      icon
    });
  }

  return token;
}

export async function action(block: DecodedLog<BountyCreatedEvent['returnValues']>, query?: EventsQuery): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};
  const {returnValues: { id, cid }, connection, address, chainId} = block;

  const bounty = await getBountyFromChain(connection, address, id, name);
  if (!bounty)
    return eventsProcessed;

  const network = await getNetwork(chainId, address);
  if (!network) {
    logger.warn(NETWORK_NOT_FOUND(name, address))
    return eventsProcessed;
  }

  const chain = await db.chains.findOne({
    where: {
      chainId: network.chain_id
    }
  });
  if (!chain) {
    logger.warn("Chain not found", network.chain_id)
    return eventsProcessed;
  }

  const dbBounty = await db.issues.findOne({
    where: {
      ipfsUrl: cid,
      network_id: network.id
    },
    include: [
      { association: "network" }
    ],
  });

  if (!dbBounty) {
    logger.warn(DB_BOUNTY_NOT_FOUND(name, cid, network.id));
    return eventsProcessed;
  }

  if (dbBounty.state !== "pending") {
    logger.warn(`${name} Bounty ${cid} was already parsed.`);
    return eventsProcessed;
  }

  dbBounty.state = "draft";
  dbBounty.amount = bounty.tokenAmount.toString();
  dbBounty.fundingAmount = bounty.fundingAmount.toString();
  dbBounty.rewardAmount = bounty.rewardAmount.toString();
  dbBounty.title = bounty.title;
  dbBounty.contractId = +id;
  dbBounty.contractCreationDate = bounty.creationDate.toString();

  await validateToken(connection, bounty.transactional, true, chainId)
    .then(async ({id, symbol}) => {
      if (isIpfsEnvs && !!chain.registryAddress) {
        try {
          logger.debug(`${name} Creating card to bounty ${dbBounty.id}`);
          const workerAmount = await getDeveloperAmount(dbBounty, chain.chainRpc);
          const card = await generateCard({
            issue: {
              ...dbBounty,
              amount: workerAmount
            },
            symbol,
          });
          const {hash} = await ipfsService.add(card);
            
          if(hash){
            dbBounty.seoImage = hash
          } else logger.warn(`${name} Failed to get hash from IPFS for ${dbBounty.id}`);
        } catch (error) {
          logger.error(`${name} Failed to generate seo image for ${dbBounty.id}`, error?.toString());
        }
      }

      return id;
    })
    .then(id => dbBounty.transactionalTokenId = id)
    .catch(error => logger.warn(`Failed to validate token ${bounty.transactional}`, error.toString()));

  if (isAddress(bounty.rewardToken) && !isZeroAddress(bounty.rewardToken))
    await validateToken(connection, bounty.rewardToken, false, chainId)
      .then(({id}) => dbBounty.rewardTokenId = id)
      .catch(error => logger.warn(`Failed to validate token ${bounty.rewardToken}`, error.toString()));

  await dbBounty.save();

  updateLeaderboardBounties();
  updateBountiesHeader();

  sendMessageToTelegramChannels(NEW_BOUNTY_OPEN(dbBounty!));

  eventsProcessed[network.name!] = {
    ...eventsProcessed[network.name!],
    [dbBounty.id.toString()]: {bounty: dbBounty, eventBlock: parseLogWithContext(block)}
  };

  const {tokenAmount, fundingAmount, rewardAmount, rewardToken, transactional} = bounty;

  Push.event(+bounty.fundingAmount > 0 ? AnalyticEventName.FUNDING_REQUEST_CREATED : AnalyticEventName.BOUNTY_CREATED, {
    chainId, network: {name: network.name, id: network.id},
    tokenAmount, fundingAmount, rewardAmount, rewardToken, transactional,
    currency: dbBounty.transactionalToken?.symbol,
    reward: dbBounty.rewardToken?.symbol,
    creator: block.returnValues.creator,
    username: dbBounty.user?.githubLogin,
    bountyId: dbBounty.id,
    bountyChainId: bounty.id
  })

  return eventsProcessed;
}
