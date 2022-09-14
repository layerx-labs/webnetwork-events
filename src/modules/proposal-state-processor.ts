import {XEvents} from "@taikai/dappkit";
import {BountyProposalDisputedEvent} from "@taikai/dappkit/dist/src/interfaces/events/network-v2-events";
import logger from "../utils/logger-handler";
import {NETWORK_BOUNTY_NOT_FOUND} from "../utils/messages.const";
import validateProposalState, {validateProposal} from "./proposal-validate-state";

export async function proposalStateProcessor(block: XEvents<BountyProposalDisputedEvent>, network, _service, eventsProcessed) {
  const {bountyId, prId, proposalId,} = block.returnValues;

  const bounty = await _service.chainService.networkService.network.getBounty(bountyId);
  if (!bounty)
    return logger.info(NETWORK_BOUNTY_NOT_FOUND(bountyId, network.networkAddress));

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