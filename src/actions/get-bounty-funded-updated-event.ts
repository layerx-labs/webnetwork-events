import db from "src/db";
import logger from "src/utils/logger-handler";
import {EventsProcessed, EventsQuery,} from "src/interfaces/block-chain-service";
import {BountyFunded} from "@taikai/dappkit/dist/src/interfaces/events/network-v2-events";
import {DB_BOUNTY_NOT_FOUND, NETWORK_NOT_FOUND} from "../utils/messages.const";
import BigNumber from "bignumber.js";
import {handleBenefactors} from "src/modules/handle-benefactors";
import {getBountyFromChain, getNetwork, parseLogWithContext} from "../utils/block-process";
import {DecodedLog} from "../interfaces/block-sniffer";
import {sendMessageToTelegramChannels} from "../integrations/telegram";
import {BOUNTY_FUNDED} from "../integrations/telegram/messages";
import {Push} from "../services/analytics/push";
import {AnalyticEventName} from "../services/analytics/types/events";
import updateSeoCardBounty from "src/modules/handle-seo-card";

export const name = "getBountyFundedEvents";
export const schedule = "*/14 * * * *";
export const description = "updating funded state of bounty";
export const author = "MarcusviniciusLsantos";

export async function action(block: DecodedLog<BountyFunded['returnValues']>, query?: EventsQuery): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};
  const {returnValues: {id,}, connection, address, chainId} = block;

  const bounty = await getBountyFromChain(connection, address, id, name);
  if (!bounty)
    return eventsProcessed;

  const network = await getNetwork(chainId, address);
  if (!network) {
    logger.warn(NETWORK_NOT_FOUND(name, address))
    return eventsProcessed;
  }

  const dbBounty = await db.issues.findOne({
    where: {contractId: id, network_id: network?.id,},
    include: [{association: "benefactors"}, {association: "network"}, {association: "transactionalToken"}]
  })

  if (!dbBounty) {
    logger.warn(DB_BOUNTY_NOT_FOUND(name, bounty.cid, network.id));
    return eventsProcessed;
  }

  dbBounty.amount =
    dbBounty.fundedAmount =
      bounty.funding.reduce((prev, current) => prev.plus(current.amount), BigNumber(0)).toFixed();

  dbBounty.fundedAt = new Date();

  await handleBenefactors(bounty.funding, dbBounty, "both", name);

  await dbBounty.save();
  
  sendMessageToTelegramChannels(BOUNTY_FUNDED(`${dbBounty.amount}${dbBounty.transactionalToken.symbol}`, `${bounty.fundingAmount}${dbBounty.transactionalToken.symbol}`, dbBounty))

  updateSeoCardBounty(dbBounty.id, name);

  eventsProcessed[network.name!] = {
    [dbBounty.id!.toString()]: {bounty: dbBounty, eventBlock: parseLogWithContext(block)}
  };

  Push.event(AnalyticEventName.BOUNTY_FUNDED, {
    chainId, network: {name: network.name, id: network.id},
    currency: dbBounty.transactionalToken?.symbol,
    reward: dbBounty.rewardToken?.symbol,
    funded: bounty.funded,
    actor: address,
    bountyId: dbBounty.id,
    bountyChainId: bounty.id
  })

  return eventsProcessed;
}
