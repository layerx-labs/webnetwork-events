import db from "src/db";
import GHService from "src/services/github";
import logger from "src/utils/logger-handler";
import {EventsProcessed, EventsQuery,} from "src/interfaces/block-chain-service";
import {slashSplit} from "src/utils/string";
import {EventService} from "../services/event-service";
import {BountyCanceledEvent} from "@taikai/dappkit/dist/src/interfaces/events/network-v2-events";
import {DB_BOUNTY_NOT_FOUND, NETWORK_BOUNTY_NOT_FOUND} from "../utils/messages.const";
import {BlockProcessor} from "../interfaces/block-processor";
import {Network_v2} from "@taikai/dappkit";
import {handleBenefactors} from "src/modules/handle-benefactors";
import BigNumber from "bignumber.js";
import {updateLeaderboardBounties} from "src/modules/leaderboard";

export const name = "getBountyCanceledEvents";
export const schedule = "*/11 * * * *";
export const description = "Move to 'Canceled' status the bounty";
export const author = "clarkjoao";

export async function action(
  query?: EventsQuery
): Promise<EventsProcessed> {

  const eventsProcessed: EventsProcessed = {};
  const service = new EventService(name, query);

  const processor: BlockProcessor<BountyCanceledEvent> = async (block, network) => {
    const bounty = await (service.Actor as Network_v2).getBounty(block.returnValues.id);
    if (!bounty)
      return logger.warn(NETWORK_BOUNTY_NOT_FOUND(name, block.returnValues.id, network.networkAddress));

    const dbBounty = await db.issues.findOne({
        where: { contractId: block.returnValues.id, issueId: bounty.cid, network_id: network.id, },
        include: [{ association: "repository" }, { association: "benefactors" }] ,});

    if (!dbBounty)
      return logger.warn(DB_BOUNTY_NOT_FOUND(name, bounty.cid, network.id));

    if (!dbBounty.githubId)
      return logger.warn(`${name} Bounty ${bounty.id} missing githubId`, bounty);

    const [owner, repo] = slashSplit(dbBounty.repository.githubPath);

    await GHService.issueClose(repo, owner, dbBounty.githubId)
      .catch(e => logger.error(`${name} Failed to close ${owner}/${repo}/issues/${dbBounty.githubId}`, e?.message || e.toString()));

    dbBounty.state = `canceled`;

    if(bounty.funding.length > 0){
      await handleBenefactors(bounty.funding, dbBounty, "delete" , name)
      dbBounty.fundedAmount = bounty.funding.reduce((prev, current) => prev.plus(current.amount), BigNumber(0)).toFixed()
    } 
    
    await dbBounty.save();

    await updateLeaderboardBounties("canceled");

    eventsProcessed[network.name] = {...eventsProcessed[network.name], [dbBounty.issueId!.toString()]: {bounty: dbBounty, eventBlock: block}};
  }

  await service._processEvents(processor);

  return eventsProcessed;
}
