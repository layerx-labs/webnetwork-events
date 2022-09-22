import {EventsProcessed, EventsQuery,} from "src/interfaces/block-chain-service";
import logger from "src/utils/logger-handler";
import {EventService} from "../services/event-service";
import {BountyProposalDisputedEvent} from "@taikai/dappkit/dist/src/interfaces/events/network-v2-events";
import {proposalStateProcessor} from "../modules/proposal-state-processor";

export const name = "getBountyProposalDisputedEvents";
export const schedule = "*/14 * * * *";
export const description = "Sync proposal disputed events";
export const author = "clarkjoao";

export async function action(query?: EventsQuery): Promise<EventsProcessed> {
  let eventsProcessed: EventsProcessed = {};

  try {

    const _service = new EventService<BountyProposalDisputedEvent>(name, query);

    await _service._processEvents(
      async (block, network) => {
        eventsProcessed = await proposalStateProcessor(block, network, _service, eventsProcessed);
      });

  } catch (err) {
    logger.error(`${name} Error`, err);
  }
  return eventsProcessed;
}
