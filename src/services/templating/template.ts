import {join, resolve} from "node:path";
import process from "process";
import {readFileSync} from "node:fs";

export class Template {
  constructor(readonly basePath: string) {
  }

  getFilePath(file: string) {
    return this.basePath.concat(file);
  }

  getHtmlOf(path: string) {
    const resolved = resolve(join(process.cwd(), this.getFilePath(path)))
    return readFileSync(resolved, "utf-8");
  }

  compile(...args: any): string {
    return ""
  };
}