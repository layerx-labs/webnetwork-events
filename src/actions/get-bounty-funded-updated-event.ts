import db from "src/db";
import logger from "src/utils/logger-handler";
import {EventsProcessed, EventsQuery,} from "src/interfaces/block-chain-service";
import {BountyFunded} from "@taikai/dappkit/dist/src/interfaces/events/network-v2-events";
import {DB_BOUNTY_NOT_FOUND} from "../utils/messages.const";
import BigNumber from "bignumber.js";
import {handleBenefactors} from "src/modules/handle-benefactors";
import {getBountyFromChain, getNetwork, parseLogWithContext} from "../utils/block-process";
import {DecodedLog} from "../interfaces/block-sniffer";
import {sendMessageToTelegramChannels} from "../integrations/telegram";
import {BOUNTY_FUNDED} from "../integrations/telegram/messages";

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
  if (!network)
    return eventsProcessed;


  const dbBounty = await db.issues.findOne({
    where: {contractId: id, issueId: bounty.cid, network_id: network?.id,},
    include: [{association: "benefactors"}, {association: "network"}]
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

  eventsProcessed[network.name!] = {
    [dbBounty.issueId!.toString()]: {bounty: dbBounty, eventBlock: parseLogWithContext(block)}
  };

  return eventsProcessed;
}
