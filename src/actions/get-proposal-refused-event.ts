import {EventsProcessed,EventsQuery,} from "src/interfaces/block-chain-service";
import logger from "src/utils/logger-handler";
import {EventService} from "../services/event-service";
import {BountyProposalRefusedEvent} from "@taikai/dappkit/dist/src/interfaces/events/network-v2-events";
import {proposalStateProcessor} from "../modules/proposal-state-processor";

export const name = "getBountyProposalRefusedEvents";
export const schedule = "*/15 * * * *";
export const description = "Sync proposal refused events";
export const author = "clarkjoao";

export async function action(
  query?: EventsQuery
): Promise<EventsProcessed> {
  let eventsProcessed: EventsProcessed = {};

  try {

    const _service = new EventService<BountyProposalRefusedEvent>(name, query);

    await _service._processEvents(
      async (block, network) => {
        eventsProcessed = await proposalStateProcessor(block, network, _service, eventsProcessed);
      })

  } catch (err) {
    logger.error(`${name} Error`, err);
  }
  return eventsProcessed;
}
