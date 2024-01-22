import {Template} from "./template";
import Handlebars from "handlebars";

export class NotificationTemplate extends Template {
  constructor() {
    super("src/integrations/notifications/templates");
  }

  compile(payload: any) {
    Handlebars.registerPartial("avatar", Handlebars.compile(this.getHtmlOf("/partials/avatar.hbs")));
    return Handlebars.compile(this.getHtmlOf(`/notif-template.hbs`))(payload?.payload, {allowProtoPropertiesByDefault: true});
  }
}