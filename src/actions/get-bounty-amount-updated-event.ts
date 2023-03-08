import db from "src/db";
import logger from "src/utils/logger-handler";
import {EventsProcessed, EventsQuery,} from "src/interfaces/block-chain-service";
import {DB_BOUNTY_NOT_FOUND} from "../utils/messages.const";
import {DecodedLog} from "../interfaces/block-sniffer";
import {getBountyFromChain, getNetwork} from "../utils/block-process";

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
    where: {contractId: id, issueId: bounty.cid, network_id: network?.id}
  });

  if (!dbBounty) {
    logger.warn(DB_BOUNTY_NOT_FOUND(name, bounty.cid, address))
    return eventsProcessed;
  }

  dbBounty.amount = bounty.tokenAmount.toString();
  await dbBounty.save();

  eventsProcessed[network.name!] = {
    [dbBounty.issueId!.toString()]: {bounty: dbBounty, eventBlock: {...block, connection: undefined}}
  };


  return eventsProcessed;
}
