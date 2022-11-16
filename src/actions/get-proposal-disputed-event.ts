import {EventsProcessed, EventsQuery,} from "src/interfaces/block-chain-service";
import {EventService} from "../services/event-service";
import {BountyProposalDisputedEvent} from "@taikai/dappkit/dist/src/interfaces/events/network-v2-events";
import {proposalStateProcessor} from "../modules/proposal-state-processor";
import { disputeProcessor } from "src/modules/dispute-processor";

export const name = "getBountyProposalDisputedEvents";
export const schedule = "*/14 * * * *";
export const description = "Sync proposal disputed events";
export const author = "clarkjoao";

export async function action(query?: EventsQuery): Promise<EventsProcessed> {
  let eventsProcessed: EventsProcessed = {};

  const _service = new EventService<BountyProposalDisputedEvent>(name, query);

  await _service._processEvents(
    async (block, network) => {
      await disputeProcessor(block, network, _service);
      eventsProcessed = await proposalStateProcessor(block, network, _service, eventsProcessed);
    });

  return eventsProcessed;
}
