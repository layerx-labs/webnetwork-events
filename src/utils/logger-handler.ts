import { Client } from "@elastic/elasticsearch";
import "dotenv/config";

const Levels = { log: "LOG", info: "INFO", error: "ERROR" };
const colorsLevels = {
  [Levels.log]: "\x1b[37m",
  [Levels.info]: "\x1b[32m",
  [Levels.error]: "\x1b[31m",
  reset: "\x1b[0m",
};
const {
  ELASTIC_SEARCH_URL: node,
  ELASTIC_SEARCH_USERNAME: username,
  ELASTIC_SEARCH_PASSWORD: password,
} = process.env;

const output = (level, message, ...rest) => { // eslint-disable-line
  let _rest;

  if (rest.some(v => v !== undefined))
    _rest = rest;

  const string = `(${level.toUpperCase()}) (${new Date().toISOString()}) ${message}\n`;
  console[level](string, _rest ? _rest : "");

  if (node && username && password) {
    const client = new Client({node, auth: {username, password} })

    client?.index({ index: "web-network-events", document: {level, timestamp: new Date(), message, rest: _rest}})
      .catch(e => console.log(e))
  }
}

const info = (message?, ...rest: any) => output(Levels.info, message, rest);
const error = (message?, ...rest: any) => output(Levels.error, message, rest);
const log = (message?, ...rest: any) => output(Levels.log, message, rest);

export default { info, error, log };
