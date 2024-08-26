import {getEmailNotificationBodyTitle, getEmailNotificationSubject} from "../../integrations/send-grid/notifications/templates/email-info";
import Handlebars from "handlebars";
import {Template} from "./template";

export class EmailTemplate extends Template {

  constructor() {
    super("src/integrations/send-grid/notifications/templates/handlebars/");
  }

  compile(payload: any) {
    const templateData = {
      pageTitle: getEmailNotificationSubject(payload.type, payload),
      notificationTitleHeading: getEmailNotificationBodyTitle(payload.type, payload),
      taskTitleParagraph: payload.title,
      actionHref: `https://app.bepro.network/${payload?.network?.name ?? "BEPRO"}/task/${payload.bountyId}/?fromEmail=${payload.uuid}`
    };

    Handlebars.registerPartial("styles", Handlebars.compile(this.getHtmlOf("partials/styles.hbs")));
    Handlebars.registerPartial("logo", Handlebars.compile(this.getHtmlOf("partials/logo.hbs")));

    return Handlebars.compile(this.getHtmlOf("base-template.hbs"))(templateData, {allowProtoPropertiesByDefault: true});
  }

}