import db from "src/db";
import logger from "src/utils/logger-handler";
import {EventsProcessed, EventsQuery,} from "src/interfaces/block-chain-service";
import {DB_BOUNTY_NOT_FOUND, NETWORK_NOT_FOUND} from "../utils/messages.const";
import {handleBenefactors} from "src/modules/handle-benefactors";
import BigNumber from "bignumber.js";
import {updateLeaderboardBounties} from "src/modules/leaderboard";
import {DecodedLog} from "../interfaces/block-sniffer";
import {getBountyFromChain, getNetwork, parseLogWithContext} from "../utils/block-process";
import {sendMessageToTelegramChannels} from "../integrations/telegram";
import {BOUNTY_STATE_CHANGED} from "../integrations/telegram/messages";
import {updateBountiesHeader} from "src/modules/handle-header-information";
import {Push} from "../services/analytics/push";
import {AnalyticEventName} from "../services/analytics/types/events";
import updateSeoCardBounty from "src/modules/handle-seo-card";
import { Op } from "sequelize";

export const name = "getBountyCanceledEvents";
export const schedule = "*/11 * * * *";
export const description = "Move to 'Canceled' status the bounty";
export const author = "clarkjoao";

export async function action(block: DecodedLog, query?: EventsQuery): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};
  const {returnValues: {id}, connection, address, chainId} = block;

  const bounty = await getBountyFromChain(connection, address, id, name);
  if (!bounty)
    return eventsProcessed;

  const network = await getNetwork(chainId, address);
  if (!network) {
    logger.warn(NETWORK_NOT_FOUND(name, address))
    return eventsProcessed;
  }

  const dbBounty = await db.issues.findOne({
    where: {contractId: block.returnValues.id, network_id: network.id, state: { [Op.not]: 'canceled' }},
    include: [
      {association: "benefactors"},
      {association: "network"},
      {association: "deliverables"}
    ],
  });

  if (!dbBounty) {
    logger.warn(DB_BOUNTY_NOT_FOUND(name, bounty.cid, network.id))
    return eventsProcessed;
  }

  const fundingAmount = dbBounty?.fundingAmount !== '0' ? dbBounty?.fundingAmount : undefined
  const fundedAmount = dbBounty?.fundedAmount !== '0' ? dbBounty?.fundedAmount : undefined
  const isFunded = BigNumber(fundingAmount || 0).isEqualTo(BigNumber(fundedAmount || 1))
  // const isHardCancel = ['open', 'ready'].includes(dbBounty?.state || '') && (dbBounty.fundingAmount === ('0' || undefined) || isFunded)

  // if(isHardCancel) {
  //   if(dbBounty?.deliverables.length > 0) 
  //     for (const dr of dbBounty?.deliverables) {
  //       await dr.destroy()
  //     }
      
  // }

  dbBounty.state = `canceled`;

  if (bounty.funding.length > 0) {
    await handleBenefactors(bounty.funding, dbBounty, "delete", name)
    dbBounty.fundedAmount = bounty.funding.reduce((prev, current) => prev.plus(current.amount), BigNumber(0)).toFixed()
  }

  await dbBounty.save();
  sendMessageToTelegramChannels(BOUNTY_STATE_CHANGED(dbBounty.state, dbBounty));

  updateLeaderboardBounties("canceled");
  updateBountiesHeader();
  updateSeoCardBounty(dbBounty.id, name);

  eventsProcessed[network.name!] = {
    [dbBounty.id!.toString()]: {bounty: dbBounty, eventBlock: parseLogWithContext(block)}
  };

  Push.event(AnalyticEventName.BOUNTY_CANCELED, {
    chainId, network: {name: network.name, id: network.id},
    bountyId: dbBounty.id, bountyContractId: bounty.id,
    title: dbBounty.title,
  })

  return eventsProcessed;
}
