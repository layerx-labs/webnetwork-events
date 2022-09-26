import {Network_v2, XEvents} from "@taikai/dappkit";
import {BountyProposalDisputedEvent} from "@taikai/dappkit/dist/src/interfaces/events/network-v2-events";
import logger from "../utils/logger-handler";
import {NETWORK_BOUNTY_NOT_FOUND} from "../utils/messages.const";
import validateProposalState, {validateProposal} from "./proposal-validate-state";
import {name} from "../actions/get-bounty-funded-updated-event";
import {EventService} from "../services/event-service";

export async function proposalStateProcessor(block: BountyProposalDisputedEvent, network, _service, eventsProcessed) {
  const {bountyId, prId, proposalId,} = block.returnValues;

  const bounty = await ((_service as EventService).Actor as Network_v2).getBounty(bountyId);
  if (!bounty)
    return logger.error(NETWORK_BOUNTY_NOT_FOUND('proposal-state-processor', bountyId, network.networkAddress));

  const values = await validateProposal(bounty, prId, proposalId, network.id);
  if (!values?.dbBounty)
    return;

  const {dbBounty,} = values;

  dbBounty.state =
    await validateProposalState(dbBounty.state!, bounty, _service.chainService.networkService);

  await dbBounty.save();

  eventsProcessed[network.name] = {...eventsProcessed[network.name], [dbBounty.issueId!.toString()]: {bounty: dbBounty, eventBlock: block}};

  return eventsProcessed;
}