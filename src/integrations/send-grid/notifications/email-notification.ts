import {EmailService} from "../email-service/email-service";
import {Templates} from "./templates";
import {EmailNotificationSubjects} from "./templates/subjects";
import {Op} from "sequelize";
import {Templater} from "./templater";
import {users} from "../../../db/models/users";
import db from "../../../db";
import {v4 as uuidv4} from "uuid";

export class EmailNotification<Payload> {
  constructor(readonly templateName: keyof typeof Templates,
              readonly payload: Payload,
              readonly targets?: Partial<users>[]) {
  }

  async send() {
    const targets =
      (this.targets?.length
          ? this.targets
          : (await db.users.findAll({where: {email: {[Op.not]: ""}}, raw: true}))
            .filter(u => u.email)
      );

    const {recipients, ids} = targets
      .filter(u => u.email)
      .reduce((p, c) => // @ts-ignore
        ({recipients: [...p.recipients, c.email], ids: [...p.ids, c.id]}), {recipients: [], ids: []}) as ({
      recipients: string[],
      ids: number[]
    });

    for (const [index, to] of recipients.entries()) {
      const uuid = uuidv4();
      await db.notifications.create({uuid, type: this.templateName, read: false, userId: ids[index]});

      await EmailService.sendEmail(
        EmailNotificationSubjects[this.templateName]!,
        [to],
        new Templater(Templates[this.templateName]!).compile({...this.payload, uuid})
      );
    }
  }
}