import {EmailService} from "../email-service/email-service";
import {Templates} from "./templates";
import {EmailNotificationSubjects} from "./templates/subjects";
import {Op} from "sequelize";
import {Templater} from "./templater";
import {users} from "../../../db/models/users";
import db from "../../../db";
import {v4 as uuidv4} from "uuid";
import loggerHandler from "../../../utils/logger-handler";

type EmailNotificationTarget = Pick<users, "email" | "id" | "user_settings">;
type EmailNotificationTargets = EmailNotificationTarget[];
type RecipientIds = { recipients: string[], ids: number[] };

export class EmailNotification<Payload> {
  constructor(readonly templateName: keyof typeof Templates,
              readonly payload: Payload,
              readonly targets?: EmailNotificationTargets) {
  }

  async send() {

    const targets =
      (this.targets?.length
          ? this.targets.filter(u => u.user_settings?.[0].notifications)
          : (await db.users.findAll({
            where: {email: {[Op.not]: ""}},
            include: [{association: "settings", where: {notifications: true}, required: true}],
            raw: true
          }))
            .filter(u => u.email)
      );

    const reduceTargetToRecipientIds = (p: { recipients: string[], ids: number[] }, c: EmailNotificationTarget) =>
      ({recipients: [...p.recipients, c.email], ids: [...p.ids, c.id]}) as RecipientIds;

    const {recipients, ids} = targets
      .filter(u => u.email)
      .reduce(reduceTargetToRecipientIds, {recipients: [], ids: []});

    for (const [index, to] of recipients.entries()) {
      const uuid = uuidv4();
      await db.notifications.create({uuid, type: this.templateName, read: false, userId: ids[index]})
        .then(_ => {
          loggerHandler.debug(`Notification created ${this.templateName}, ${uuid}, userId: ${ids[index]}`)
        })
        .catch(e => {
          loggerHandler.error(`Failed to create notification ${this.templateName}, ${uuid}, userId: ${ids[index]}`, e?.toString());
        })

      await EmailService.sendEmail(
        EmailNotificationSubjects[this.templateName]!,
        [to],
        new Templater(Templates[this.templateName]!).compile({...this.payload, uuid})
      );
    }
  }
}