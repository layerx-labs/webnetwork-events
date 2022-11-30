import db from "src/db";
import logger from "src/utils/logger-handler";
import {BountyToken} from "@taikai/dappkit";
import {EventsProcessed, EventsQuery,} from "src/interfaces/block-chain-service";
import {EventService} from "../services/event-service";
import {TransferEvent} from "@taikai/dappkit/dist/src/interfaces/events/bounty-token-events";
import {BlockProcessor} from "../interfaces/block-processor";
import { leaderboardAttributes } from "src/db/models/leaderboard";

export const name = "getTransferEvents";
export const schedule = "*/60 * * * *";
export const description = "retrieving bounty token transfer events";
export const author = "MarcusviniciusLsantos";

export async function action(query?: EventsQuery): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};
  const service = new EventService(name, query, false, undefined, undefined, BountyToken);
  console.log('service --------------->', service.customActor)

  const processor: BlockProcessor<TransferEvent> = async (block, network) => {
    const { to, tokenId } = block.returnValues
    console.log('returns values', to, tokenId)

    let result: leaderboardAttributes = { address: "", id: 0, numberNfts: 0 }

    const userLeaderboard = await db.leaderboard.findOne({ where: { address: to }})

    const nftToken = await service.customActor.getBountyToken(tokenId) 

    if(userLeaderboard && nftToken){
       userLeaderboard.numberNfts += 1
       result = await userLeaderboard.save()
    } else if(!userLeaderboard && nftToken){
       result = await db.leaderboard.create({
            address: to,
            numberNfts: 1
       })
    }
   
    eventsProcessed[network?.name || '0'] = result ? [result.address] : [];
  }

  await service._processEvents(processor);

  return eventsProcessed;
}
