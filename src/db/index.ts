import "dotenv/config";
import { Dialect, Options, Sequelize } from "sequelize";
import { initModels } from "./models/init-models";

const {
  DB_DATABASE: database,
  DB_HOST: host,
  DB_PASSWORD: password,
  DB_PORT: port,
  DB_USERNAME: username,
  DB_DIALECT: dialect,
  DB_LOG,
  DB_SSL,
} = process.env;

if ([database, host, password, port, username].some((v) => !v))
  throw new Error(`Missing database variables`);

const options: Options = {
  username: username || "github",
  password: password || "github",
  database: database || "github",
  dialect: (dialect as Dialect) || "postgres",
  host: host || "localhost",
  port: +(port || 54320),
  logging: !DB_LOG ? false : console.log,
};

if (DB_SSL === "true")
  options.dialectOptions = {
    ssl: {
      required: true,
      rejectUnauthorized: false,
    },
  };

const con = new Sequelize(
  options.database!,
  options.username!,
  options.password!,
  options
);

const modules = initModels(con);

export default modules;
