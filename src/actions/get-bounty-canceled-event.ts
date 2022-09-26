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
      return logger.error(NETWORK_BOUNTY_NOT_FOUND(name, block.returnValues.id, network.networkAddress));

    const dbBounty = await db.issues.findOne({
        where: { contractId: block.returnValues.id, issueId: bounty.cid, network_id: network.id, },
        include: [{ association: "token" }, { association: "repository" }],});

    if (!dbBounty)
      return logger.error(DB_BOUNTY_NOT_FOUND(name, bounty.cid, network.id));

    if (!dbBounty.githubId)
      return logger.error(`${name} Bounty ${bounty.id} missing githubId`, bounty);

    const [owner, repo] = slashSplit(dbBounty.repository.githubPath);

    await GHService.issueClose(repo, owner, dbBounty.githubId)
      .catch(e => logger.error(`${name} Failed to close ${owner}/${repo}/issues/${dbBounty.githubId}`, e));

    dbBounty.state = `canceled`;
    await dbBounty.save();

    eventsProcessed[network.name] = {...eventsProcessed[network.name], [dbBounty.issueId!.toString()]: {bounty: dbBounty, eventBlock: block}};
  }

  await service._processEvents(processor);

  return eventsProcessed;
}
