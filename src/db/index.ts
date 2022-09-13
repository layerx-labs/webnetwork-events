import "dotenv/config";
import { Sequelize, Dialect } from "sequelize";
import { initModels } from "./models/init-models";

const {
  DB_DATABASE: database,
  DB_HOST: host,
  DB_PASSWORD: password,
  DB_PORT: port,
  DB_USERNAME: username,
  DB_DIALECT: dialect,
  DB_LOG,
} = process.env;

if ([database, host, password, port, username].some((v) => !v))
  throw new Error(`Missing database variables`);

// ts-ignore
const options = {
  username: username || "github",
  password: password || "github",
  database: database || "github",
  dialect: (dialect as Dialect) || "postgres",
  host: host || "localhost",
  port: +(port || 54320),
  logging: !DB_LOG ? false : console.log
};

const con = new Sequelize(
  options.database,
  options.username,
  options.password,
  options
);

const modules = initModels(con);

export default modules;
