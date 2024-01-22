import {readFileSync} from "node:fs";
import {join, resolve} from "node:path";
import process from "process";
import {EmailNotificationSubjects} from "./templates/email-info";
import {format} from "node:util";

export class Templater {

  constructor(readonly file: string) {
  }

  readonly basePath = "src/integrations/notifications/templates/handlebars/";

  get html() {
    return this.getHtmlOf("base-template.hbs");
  }

  getFilePath(file: string) {
    return this.basePath.concat(file);
  }

  compile(payload: any) {

    const templateData = {
      pageTitle: format(EmailNotificationSubjects[payload.template], payload.network.name),
      notificationTitleHeading: format(EmailNotificationSubjects[payload.template], payload.network.name),
      taskTitleParagraph: payload.title,
      actionHref: `https://app.bepro.network/${payload.network.name}/task/${payload.bountyId}/?fromEmail=${payload.uuid}`
    };

    Handlebars.registerPartial("styles", Handlebars.compile(this.getHtmlOf(this.getFilePath("partials/styles.hbs"))));
    Handlebars.registerPartial("logo", Handlebars.compile(this.getHtmlOf(this.getFilePath("partials/styles.hbs"))));

    return Handlebars.compile(this.html)(templateData, {allowProtoPropertiesByDefault: true});
  }

  private getHtmlOf(path: string) {
    return readFileSync(resolve(join(process.cwd(), this.getFilePath(path), this.file)), "utf-8")
  }

}