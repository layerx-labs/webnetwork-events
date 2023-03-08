import {EventsProcessed, EventsQuery,} from "src/interfaces/block-chain-service";
import {BountyProposalDisputedEvent} from "@taikai/dappkit/dist/src/interfaces/events/network-v2-events";
import {proposalStateProcessor} from "../modules/proposal-state-processor";
import {disputeProcessor} from "src/modules/dispute-processor";
import {updateLeaderboardProposals} from "src/modules/leaderboard";
import {DecodedLog} from "../interfaces/block-sniffer";

export const name = "getBountyProposalDisputedEvents";
export const schedule = "*/14 * * * *";
export const description = "Sync proposal disputed events";
export const author = "clarkjoao";

export async function action(block: DecodedLog<BountyProposalDisputedEvent['returnValues']>, query?: EventsQuery): Promise<EventsProcessed> {
  let eventsProcessed: EventsProcessed = {};

  await disputeProcessor(block);
  eventsProcessed = await proposalStateProcessor(block, eventsProcessed);
  await updateLeaderboardProposals("rejected");

  return eventsProcessed;
}
