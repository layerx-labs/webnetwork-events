import db from "src/db";
import logger from "src/utils/logger-handler";
import {EventsProcessed, EventsQuery,} from "src/interfaces/block-chain-service";
import {BountyPullRequestReadyForReviewEvent} from "@taikai/dappkit/dist/src/interfaces/events/network-v2-events";
import {DB_BOUNTY_NOT_FOUND, NETWORK_NOT_FOUND} from "../utils/messages.const";
import {DecodedLog} from "../interfaces/block-sniffer";
import {getBountyFromChain, getNetwork, parseLogWithContext} from "../utils/block-process";
import {sendMessageToTelegramChannels} from "../integrations/telegram";
import {BOUNTY_STATE_CHANGED} from "../integrations/telegram/messages";
import {Push} from "../services/analytics/push";
import {AnalyticEventName} from "../services/analytics/types/events";
import updateSeoCardBounty from "src/modules/handle-seo-card";
import {Op, Sequelize} from "sequelize";

export const name = "getBountyPullRequestReadyForReviewEvents";
export const schedule = "*/12 * * * *";
export const description = "Sync pull-request created events";
export const author = "clarkjoao";

export async function action(block: DecodedLog<BountyPullRequestReadyForReviewEvent['returnValues']>, query?: EventsQuery): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};

  const {returnValues: {bountyId, pullRequestId}, connection, address, chainId} = block;

  const bounty = await getBountyFromChain(connection, address, bountyId, name);
  if (!bounty)
    return eventsProcessed;

  const network = await getNetwork(chainId, address);
  if (!network) {
    logger.warn(NETWORK_NOT_FOUND(name, address))
    return eventsProcessed;
  }

  const dbBounty = await db.issues.findOne({
    where: {contractId: bountyId, network_id: network.id},
    include: [{association: "network", include: [{association: "chain"}]}]
  })
  if (!dbBounty) {
    logger.warn(DB_BOUNTY_NOT_FOUND(name, bounty.cid, network.id));
    return eventsProcessed;
  }

  const pullRequest = bounty.pullRequests[pullRequestId];

  const dbDeliverable = await db.deliverables.findOne({
    where: {id: pullRequest.cid, markedReadyForReview: false},
    include: {association: 'user'}
  });

  if (!dbDeliverable) {
    logger.warn(`${name} No deliverable found with "draft" and id ${pullRequest.cid}, maybe it was already parsed?`);
    return eventsProcessed;
  }

  dbDeliverable.canceled = pullRequest.canceled;
  dbDeliverable.markedReadyForReview = pullRequest?.ready;

  await dbDeliverable.save();

  if (!["canceled", "closed", "proposal"].includes(dbBounty.state!)) {
    dbBounty.state = "ready";
    await dbBounty.save();
    sendMessageToTelegramChannels(BOUNTY_STATE_CHANGED(`ready`, dbBounty));

    updateSeoCardBounty(dbBounty.id, name);
  }

  eventsProcessed[network.name!] = {
    [dbBounty.id!.toString()]: {bounty: dbBounty, eventBlock: parseLogWithContext(block)}
  };

  /** Create a non-blocking scope, so that we can await for targets but let the fn end */
  (async () => {
    const owner = await dbBounty!.getUser({attributes: ["email", "id"], include:[{ association: "user_settings" }] });

    const curators = await db.curators.findAll({
      include: [
        {
          association: "user", 
          required: true,
          attributes: ["email", "id"],
          where: {
            id: { 
              [Op.not]: owner.id
            },
          },
          on: Sequelize.where(Sequelize.fn("lower", Sequelize.col("curators.address")),
                              "=",
                              Sequelize.fn("lower", Sequelize.col("user.address"))),
        }
      ],
      where: {
        networkId: dbBounty.network_id,
        isCurrentlyCurator: true
      }
    });

    const targets = curators.map(curators => curators.user);

    const AnalyticEvent = {
      name: AnalyticEventName.PULL_REQUEST_READY,
      params: {
        chainId, network: {name: network.name, id: network.id},
        bountyId: dbBounty.id, bountyContractId: dbBounty.contractId,
        deliverableId: dbDeliverable.id, deliverableContractId: pullRequestId,
        actor: pullRequest.creator,
      }
    };

    const NotificationEvent = {
      name: AnalyticEventName.NOTIF_DELIVERABLE_READY,
      params: {
        targets: [...targets, owner],
        bountyId: dbBounty.id,
        creator: {
          address: dbDeliverable.user.address,
          id: dbDeliverable.user.id,
          username: dbDeliverable.user.handle,
        },
        task: {
          id: dbDeliverable.bountyId,
          title: dbBounty.title,
          network: dbBounty.network.name,
        },
        deliverable: {
          title: dbDeliverable.title,
          id: dbDeliverable.id,
          link: `${dbBounty.network.name}/task/${dbBounty.id}/deliverable/${dbDeliverable.id}`
        }
      }
    };

    Push.events([AnalyticEvent, NotificationEvent]);
  })()


  return eventsProcessed;
}
