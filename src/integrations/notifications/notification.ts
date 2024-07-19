import db from "../../db";
import {error, info} from "../../utils/logger-handler";
import {getEventTargets} from "../../utils/get-event-targets";
import {NotificationTemplate} from "../../services/templating/notification-template";
import {v4 as uuidv4} from "uuid";
import { CollectEventPayloadParams } from "src/services/analytics/types/analytics";

export class Notification {
  static async create(type: string, payload: CollectEventPayloadParams) {
    const {ids,} = await getEventTargets(type, payload);
    const template =
      new NotificationTemplate().compile({type, payload});

    for (const userId of ids) {
      const uuid = uuidv4();
      await db.notifications.create({uuid, type, read: false, userId, template})
        .then(_ => {
          info(`Notification created ${type}, ${uuid}, userId: ${userId}`);
        })
        .catch(e => {
          error(`Failed to create notification ${type}, ${uuid}, userId: ${userId}`, e?.toString());
        })
    }
  }
}