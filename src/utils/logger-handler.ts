import { Client } from "@elastic/elasticsearch";
import "dotenv/config";

enum DebugLevel { none, error, warn, info, log};
const Levels = { log: "log", info: "info", error: "error", warn: "warn" };

const {
  NEXT_ELASTIC_SEARCH_URL: node,
  NEXT_ELASTIC_SEARCH_USERNAME: username,
  NEXT_ELASTIC_SEARCH_PASSWORD: password,
} = process.env;

const LOG_LEVEL = process.env.LOG_LEVEL ? parseInt(process.env.LOG_LEVEL, 10) : DebugLevel.log;

const output = (level, message, rest) => { // eslint-disable-line
  if (LOG_LEVEL && LOG_LEVEL < +DebugLevel[level])
    return;

  let _rest;

  if (rest.some(v => v !== undefined))
    _rest = rest;

  const string = `(${level.toUpperCase()}) (${new Date().toISOString()}) ${message}\n`;
  console[level](string, _rest ? _rest : "");

  if (node && username && password) {
    const client = new Client({node, auth: {username, password} })

    client?.index({
        index: "web-network-events",
        document: {level, timestamp: new Date(), message, rest: _rest, webAppUrl: process.env.WEBAPP_URL}})
      .catch(e => console.log(e))
  }
}

const info = (message?, ...rest: any) => output(Levels.info, message, rest);
const error = (message?, ...rest: any) => output(Levels.error, message, rest);
const log = (message?, ...rest: any) => output(Levels.log, message, rest);
const warn = (message?, ...rest: any) => output(Levels.warn, message, rest);

export default { info, error, log, warn };
