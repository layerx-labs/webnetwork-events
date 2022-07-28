import "dotenv/config";

const Levels = { log: "LOG", info: "INFO", error: "ERROR" };

const output = (level, message, ...rest) => {
  const msg = rest.length ? message : "No message";

  if (!rest.length || !rest) rest = message;

  const string = `(${level}) (${new Date().toISOString()}) ${msg}\n`;
  if (process.env.LOGS_ACTIVE) console.log(string, rest);
};

export const info = (message = null, ...rest) =>
  output(Levels.info, message, rest);
export const error = (message = null, ...rest) =>
  output(Levels.error, message, rest);
export const log = (message = null, ...rest) =>
  output(Levels.log, message, rest);

export default { info, error, log };
