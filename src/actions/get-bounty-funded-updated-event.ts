import db from "src/db";
import logger from "src/utils/logger-handler";
import {EventsProcessed, EventsQuery,} from "src/interfaces/block-chain-service";
import {EventService} from "../services/event-service";
import {BountyFunded} from "@taikai/dappkit/dist/src/interfaces/events/network-v2-events";
import {DB_BOUNTY_NOT_FOUND, NETWORK_BOUNTY_NOT_FOUND} from "../utils/messages.const";
import {BlockProcessor} from "../interfaces/block-processor";
import {Network_v2} from "@taikai/dappkit";
import BigNumber from "bignumber.js";
import {handleBenefactors} from "src/modules/handle-benefactors";
import {sendMessageToTelegramChannels} from "../integrations/telegram";
import {BOUNTY_FUNDED} from "../integrations/telegram/messages";

export const name = "getBountyFundedEvents";
export const schedule = "*/14 * * * *";
export const description = "updating funded state of bounty";
export const author = "MarcusviniciusLsantos";

export async function action(query?: EventsQuery): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};
  const service = new EventService(name, query);

  const processor: BlockProcessor<BountyFunded> = async (block, network) => {
    const {id, amount} = block.returnValues;

    const bounty = await (service.Actor as Network_v2).getBounty(+id);
    if (!bounty)
      return logger.warn(NETWORK_BOUNTY_NOT_FOUND(name, id, network.networkAddress));

    const dbBounty = await db.issues.findOne({
      where: {contractId: id, issueId: bounty.cid, network_id: network?.id,},
      include: [{ association: "benefactors" }, {association: "network"}]
    })
    
    if (!dbBounty)
      return logger.warn(DB_BOUNTY_NOT_FOUND(name, bounty.cid, network.id));

    dbBounty.amount =
      dbBounty.fundedAmount =
        bounty.funding.reduce((prev, current) => prev.plus(current.amount), BigNumber(0)).toFixed();
        
    dbBounty.fundedAt = new Date()
    
    await handleBenefactors(bounty.funding, dbBounty, "both" , name)

    await dbBounty.save();

    sendMessageToTelegramChannels(BOUNTY_FUNDED(`${amount}${dbBounty.token.symbol}`, `${bounty.fundingAmount}${dbBounty.token.symbol}`, dbBounty))

    eventsProcessed[network.name] = {...eventsProcessed[network.name], [dbBounty.issueId!.toString()]: {bounty: dbBounty, eventBlock: block}};
  }

  await service._processEvents(processor);

  return eventsProcessed;
}
