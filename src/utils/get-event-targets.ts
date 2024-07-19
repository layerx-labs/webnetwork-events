import { users } from "src/db/models/users";
import db from "src/db";

import { CollectEventPayloadParams } from "src/services/analytics/types/analytics";
import { NotificationType, shouldSendNotification } from "./notifications/get-user-notification-settings";
import { AnalyticEventName } from "src/services/analytics/types/events";

type Target = Pick<users, "email" | "id" | "user_settings">;

const analyticToNotificationMap = {
  [AnalyticEventName.BOUNTY_CREATED]: "taskOpen",
  [AnalyticEventName.FUNDING_REQUEST_CREATED]: "taskOpen",
  [AnalyticEventName.NOTIF_TASK_CREATED]: "taskOpen",
  [AnalyticEventName.NOTIF_TASK_FUNDING_CREATED]: "taskOpen",
  [AnalyticEventName.PULL_REQUEST_READY]: "deliverableReady",
  [AnalyticEventName.NOTIF_DELIVERABLE_READY]: "deliverableReady",
  [AnalyticEventName.MERGE_PROPOSAL_OPEN]: "proposalCreated",
  [AnalyticEventName.NOTIF_PROPOSAL_OPEN]: "proposalCreated",
  [AnalyticEventName.MERGE_PROPOSAL_DISPUTED]: "proposalDisputed",
  [AnalyticEventName.NOTIF_PROPOSAL_DISPUTED]: "proposalDisputed",
};

export async function getEventTargets(type: string, payload: CollectEventPayloadParams) {
  const notificationType = analyticToNotificationMap[type] as NotificationType;

  let targets = payload?.targets;

  if (!targets?.length)
    targets = await db.users.findAll();

  targets = (await Promise.all(targets.map(async (target) => {
    const shouldSend = 
        await shouldSendNotification(target.id, notificationType, payload?.bountyId);

    if (!shouldSend)
      return null;

    return target;
  }))).filter(target => !!target) as Target[];

  const reduceTargetToRecipientIds = (p: {
    recipients: string[],
    ids: number[]
  }, c: Target) =>
    ({recipients: [...p.recipients, c.email], ids: [...p.ids, c.id]}) as { recipients: string[], ids: number[] };

  return targets.reduce(reduceTargetToRecipientIds, {recipients: [], ids: []});
}