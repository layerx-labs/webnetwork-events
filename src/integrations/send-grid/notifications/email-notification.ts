import {EmailService} from "../email-service/email-service";
import {Templates} from "./templates";
import {getEmailNotificationSubject} from "./templates/email-info";
import {EmailTemplate} from "../../../services/templating/email-template";
import {users} from "../../../db/models/users";
import {v4 as uuidv4} from "uuid";
import {getEventTargets} from "../../../utils/get-event-targets";
import { CollectEventPayloadParams } from "src/services/analytics/types/analytics";
import { AnalyticEventName } from "src/services/analytics/types/events";

type EmailNotificationTarget = Pick<users, "email" | "id" | "user_settings">;
type EmailNotificationTargets = EmailNotificationTarget[];

export class EmailNotification {
  constructor(readonly type: AnalyticEventName,
              readonly payload: CollectEventPayloadParams,
              readonly targets?: EmailNotificationTargets) {
  }

  async send() {
    const templateName = Templates[this.type] || "base-template.hbs";

    const {recipients, ids} = await getEventTargets(this.type, this.payload);

    for (const [index, to] of recipients.filter(e => e).entries()) {
      const uuid = uuidv4();
      await EmailService.sendEmail(
        getEmailNotificationSubject(this.type, this.payload),
        [to],
        new EmailTemplate().compile({...this.payload, type: this.type, template: templateName, uuid})
      );
    }
  }
}