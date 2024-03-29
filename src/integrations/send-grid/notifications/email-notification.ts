import {EmailService} from "../email-service/email-service";
import {Templates} from "./templates";
import {EmailNotificationSubjects} from "./templates/email-info";
import {EmailTemplate} from "../../../services/templating/email-template";
import {users} from "../../../db/models/users";
import {v4 as uuidv4} from "uuid";
import {format} from "node:util"
import {getEventTargets} from "../../../utils/get-event-targets";

type EmailNotificationTarget = Pick<users, "email" | "id" | "user_settings">;
type EmailNotificationTargets = EmailNotificationTarget[];

export class EmailNotification<Payload = any> {
  constructor(readonly templateName: keyof typeof Templates,
              readonly payload: Payload,
              readonly targets?: EmailNotificationTargets) {
  }

  async send() {

    const {recipients, ids} = await getEventTargets(this.targets);

    for (const [index, to] of recipients.filter(e => e).entries()) {
      const uuid = uuidv4();
      await EmailService.sendEmail(
        format(EmailNotificationSubjects[this.templateName]!, (this.payload as any)?.network?.name ?? "BEPRO"),
        [to],
        new EmailTemplate().compile({...this.payload, template: this.templateName, uuid})
      );
    }
  }
}