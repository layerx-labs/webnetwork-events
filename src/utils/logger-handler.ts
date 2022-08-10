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

const output = (level: string, message: string | any, rest) => {
  const msg = rest.length ? message : "No message";

  if (!rest.length || !rest) rest = message;

  const string = `(${level}) (${new Date().toISOString()}) ${msg}\n`;
  console.log(colorsLevels[level], string, rest, colorsLevels.reset);

  if (node && username && password) {
    const client = new Client({ node, auth: { username, password } });

    client
      ?.index({
        index: "web-network",
        document: { level, timestamp: new Date(), message, rest },
      })
      .catch((e) => console.log(e));
  }
};

const info = (message?, ...rest: any) => output(Levels.info, message, rest);
const error = (message?, ...rest: any) => output(Levels.error, message, rest);
const log = (message?, ...rest: any) => output(Levels.log, message, rest);

export default { info, error, log };
