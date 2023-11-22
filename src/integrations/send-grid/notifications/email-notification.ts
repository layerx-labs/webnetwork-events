import {EmailService} from "../email-service/email-service";
import {Templates} from "./templates";
import {EmailNotificationSubjects} from "./templates/subjects";
import db from "../../../db";
import {Op} from "sequelize";
import {Templater} from "./templater";

export class EmailNotification<Payload> {
  constructor(readonly templateName: keyof typeof Templates,
              readonly payload: Payload,
              readonly targets?: { email: string }[]) {
  }

  async send() {
    const recipients =
      (this.targets?.length
          ? this.targets
          : await db.users.findAll({where: {email: {[Op.not]: ""}}, raw: true})
      ).map(u => u.email);

    return EmailService.sendEmail(
      EmailNotificationSubjects[this.templateName]!,
      recipients,
      new Templater(Templates[this.templateName]!).compile(this.payload)
    );
  }
}