import db from "src/db";
import GHService from "src/services/github";
import logger from "src/utils/logger-handler";
import {EventsProcessed, EventsQuery,} from "src/interfaces/block-chain-service";
import {slashSplit} from "src/utils/string";
import {DB_BOUNTY_NOT_FOUND} from "../utils/messages.const";
import {handleBenefactors} from "src/modules/handle-benefactors";
import BigNumber from "bignumber.js";
import {updateLeaderboardBounties} from "src/modules/leaderboard";
import {DecodedLog} from "../interfaces/block-sniffer";
import {getBountyFromChain, getNetwork} from "../utils/block-process";

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
  if (!network)
    return eventsProcessed;

  const dbBounty = await db.issues.findOne({
    where: {contractId: block.returnValues.id, issueId: bounty.cid, network_id: network.id,},
    include: [{association: "repository"}, {association: "benefactors"}],
  });

  if (!dbBounty) {
    logger.warn(DB_BOUNTY_NOT_FOUND(name, bounty.cid, network.id))
    return eventsProcessed;
  }

  if (!dbBounty.githubId) {
    logger.warn(`${name} Bounty ${bounty.id} missing githubId`, bounty);
    return eventsProcessed
  }


  const [owner, repo] = slashSplit(dbBounty.repository.githubPath);

  await GHService.issueClose(repo, owner, dbBounty.githubId)
    .catch(e => logger.error(`${name} Failed to close ${owner}/${repo}/issues/${dbBounty.githubId}`, e?.message || e.toString()));

  dbBounty.state = `canceled`;

  if (bounty.funding.length > 0) {
    await handleBenefactors(bounty.funding, dbBounty, "delete", name)
    dbBounty.fundedAmount = bounty.funding.reduce((prev, current) => prev.plus(current.amount), BigNumber(0)).toFixed()
  }

  await dbBounty.save();

  await updateLeaderboardBounties("canceled");

  eventsProcessed[network.name!] = {
    [dbBounty.issueId!.toString()]: {bounty: dbBounty, eventBlock: block}
  };


  return eventsProcessed;
}
