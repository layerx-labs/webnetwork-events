import {EventsProcessed, EventsQuery,} from "src/interfaces/block-chain-service";
import validateProposalState, {validateProposal} from "src/modules/proposal-validate-state";
import logger from "src/utils/logger-handler";
import {EventService} from "../services/event-service";
import {XEvents} from "@taikai/dappkit";
import {BountyProposalDisputedEvent} from "@taikai/dappkit/dist/src/interfaces/events/network-v2-events";
import {NETWORK_BOUNTY_NOT_FOUND} from "../utils/messages.const";
import {proposalStateProcessor} from "../modules/proposal-state-processor";

export const name = "getBountyProposalDisputedEvents";
export const schedule = "*/10 * * * *"; // Each 10 minutes
export const description = "Sync proposal disputed events";
export const author = "clarkjoao";

export async function action(query?: EventsQuery): Promise<EventsProcessed> {
  let eventsProcessed: EventsProcessed = {};

  try {

    const _service = new EventService(name, query);

    await _service.processEvents<BountyProposalDisputedEvent>(
      async (block, network) => {
        eventsProcessed = await proposalStateProcessor(block, network, _service, eventsProcessed);
      });

  } catch (err) {
    logger.error(`Error ${name}:`, err);
  }
  return eventsProcessed;
}
