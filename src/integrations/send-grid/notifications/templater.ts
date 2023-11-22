import {readFileSync} from "node:fs";
import {join, resolve} from "node:path";
import process from "process";

export class Templater {

  constructor(readonly file: string) {
  }

  get html() {
    return readFileSync(resolve(join(process.cwd(), "src/integrations/notifications/templates", this.file)), "utf-8");
  }

  compile(payload: any) {
    return Handlebars.compile(this.html)(payload, {allowProtoPropertiesByDefault: true})
  }

}