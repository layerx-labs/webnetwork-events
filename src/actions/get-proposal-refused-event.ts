import {EventsProcessed, EventsQuery,} from "src/interfaces/block-chain-service";
import {BountyProposalRefusedEvent} from "@taikai/dappkit/dist/src/interfaces/events/network-v2-events";
import {proposalStateProcessor} from "../modules/proposal-state-processor";
import {updateLeaderboardProposals} from "src/modules/leaderboard";
import {DecodedLog} from "../interfaces/block-sniffer";

export const name = "getBountyProposalRefusedEvents";
export const schedule = "*/15 * * * *";
export const description = "Sync proposal refused events";
export const author = "clarkjoao";

export async function action(block: DecodedLog<BountyProposalRefusedEvent['returnValues']>, query?: EventsQuery): Promise<EventsProcessed> {
  let eventsProcessed: EventsProcessed = {};

  eventsProcessed = await proposalStateProcessor(block, eventsProcessed);
  await updateLeaderboardProposals("rejected");

  return eventsProcessed;
}
