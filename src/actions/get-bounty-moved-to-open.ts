import db from "src/db";
import logger from "src/utils/logger-handler";
import {subMilliseconds} from "date-fns";
import {Op} from "sequelize";
import {EventsProcessed, EventsQuery,} from "src/interfaces/block-chain-service";
import {Network_v2, Web3Connection} from "@taikai/dappkit";
import {getChainsRegistryAndNetworks} from "../utils/block-process";
import {sendMessageToTelegramChannels} from "../integrations/telegram";
import {BOUNTY_STATE_CHANGED} from "../integrations/telegram/messages";
import {Push} from "../services/analytics/push";
import {AnalyticEventName} from "../services/analytics/types/events";
import updateSeoCardBounty from "src/modules/handle-seo-card";
import { getCoinPrice } from "../services/coingecko";
import { savePointEvent } from "../modules/points-system/save-point-event";
import { getOrUpdateLastTokenPrice } from "../modules/tokens";
import { handleFundedFundingPoints } from "src/modules/points-system/handle-funded-funding-points";

export const name = "get-bounty-moved-to-open";
export const schedule = "*/1 * * * *";
export const description =
  "move to 'OPEN' all 'DRAFT' bounties that have Draft Time finished as set at the block chain";
export const author = "clarkjoao";

const {
  NEXT_WALLET_PRIVATE_KEY: privateKey,
  NEXT_PUBLIC_CURRENCY_MAIN: currency = "eur",
} = process.env;

export async function action(query?: EventsQuery): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};

  const entries = await getChainsRegistryAndNetworks();
  for (const [web3Host, {chainId: chain_id,}] of entries) {

    try {
      logger.info(`${name} start`);

      if (!chain_id) {
        logger.error(`${name}: Missing EVENTS_CHAIN_ID`);

        return eventsProcessed;
      }

      const web3Connection = new Web3Connection({web3Host, privateKey});
      await web3Connection.start();

      const timeOnChain = await web3Connection.Web3.eth.getBlock(`latest`).then(({timestamp}) => +timestamp * 1000);

      const networks = await db.networks.findAll({
        where: {
          isRegistered: true,
          chain_id
        },
        raw: true
      });
      if (!networks || !networks.length) {
        logger.warn(`${name} found no networks`);
        return eventsProcessed;
      }

      for (const {networkAddress, id: network_id, name: networkName} of networks) {
        const _network = new Network_v2(web3Connection, networkAddress);
        await _network.start();
        const draftTime = await _network.draftTime();
        const bounties =
          await db.issues.findAll({
            where: {
              createdAt: {[Op.lt]: subMilliseconds(timeOnChain, draftTime)},
              network_id,
              state: "draft"
            },
            include: [{association: "network"}, {association: "user"}]
          });

        logger.info(`${name} found ${bounties.length} draft bounties on ${networkAddress}`);

        if (!bounties || !bounties.length)
          continue;

        for (const dbBounty of bounties) {
          logger.info(`${name} Parsing bounty ${dbBounty.id}`);

          dbBounty.state = "open";
          await dbBounty.save();
          sendMessageToTelegramChannels(BOUNTY_STATE_CHANGED(dbBounty.state!, dbBounty));

          updateSeoCardBounty(dbBounty.id, name);

          if (!dbBounty.fundingAmount) {
            const tokenPrice = await getOrUpdateLastTokenPrice(dbBounty.transactionalTokenId!, currency);

            await savePointEvent( "created_task", 
                                  dbBounty.user.address!, 
                                  { taskId: dbBounty.id, taskAmount: dbBounty.amount, tokenPrice, currency },
                                  (pointsPerAction, scalingFactor) => pointsPerAction * scalingFactor * +dbBounty.amount! * tokenPrice);
          } else {
            await handleFundedFundingPoints({
              bounty: await _network.getBounty(dbBounty.contractId!),
              issue: dbBounty
            });
          }

          eventsProcessed[networkName!] = {
            ...eventsProcessed[networkName!],
            [dbBounty.id!.toString()]: {bounty: dbBounty, eventBlock: null}
          };

          logger.info(`${name} Parsed bounty ${dbBounty.id}`);


          Push.event(AnalyticEventName.BOUNTY_ACTIVE, {
            chainId: chain_id, network: {name: networkName, id: network_id},
            bountyId: dbBounty.id, bountyContractId: dbBounty.contractId,
            title: dbBounty.title,
          })
        }
      }
    } catch (err: any) {
      logger.error(`${name} Error`, err);
    }

  }

  return eventsProcessed;
}
