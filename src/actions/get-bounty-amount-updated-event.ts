import db from "src/db";
import logger from "src/utils/logger-handler";
import {EventsProcessed, EventsQuery,} from "src/interfaces/block-chain-service";
import {DB_BOUNTY_NOT_FOUND} from "../utils/messages.const";
import {DecodedLog} from "../interfaces/block-sniffer";
import {getBountyFromChain, getNetwork,parseLogWithContext} from "../utils/block-process";
import {sendMessageToTelegramChannels} from "../integrations/telegram";
import {BOUNTY_AMOUNT_UPDATED} from "../integrations/telegram/messages";

export const name = "getBountyAmountUpdatedEvents";
export const schedule = "*/13 * * * *";
export const description = "retrieving bounty updated events";
export const author = "clarkjoao";

export async function action(block: DecodedLog, query?: EventsQuery): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};
  const {returnValues: {id}, connection, address, chainId} = block;

  const bounty = await getBountyFromChain(connection, address, id, name);
  if (!bounty)
    return eventsProcessed;

  const network = await getNetwork(chainId, address);
  if (!network)
    return eventsProcessed;


  const dbBounty = await db.issues.findOne({
    where: {contractId: id, issueId: bounty.cid, network_id: network?.id},
    include: [
      {association: "network"}
    ]
  });

  if (!dbBounty) {
    logger.warn(DB_BOUNTY_NOT_FOUND(name, bounty.cid, address))
    return eventsProcessed;
  }

  dbBounty.amount = bounty.tokenAmount.toString();
  await dbBounty.save();
  
  sendMessageToTelegramChannels(BOUNTY_AMOUNT_UPDATED(dbBounty.amount, dbBounty));

  eventsProcessed[network.name!] = {
    [dbBounty.issueId!.toString()]: {bounty: dbBounty, eventBlock: parseLogWithContext(block)}
  };


  return eventsProcessed;
}
