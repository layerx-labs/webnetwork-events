import "dotenv/config";
import { Dialect, Options, Sequelize } from "sequelize";
import { initModels } from "./models/init-models";

const {
  NEXT_DB_DATABASE: database,
  NEXT_DB_HOST: host,
  NEXT_DB_PASSWORD: password,
  NEXT_DB_PORT: port,
  NEXT_DB_USERNAME: username,
  NEXT_DB_DIALECT: dialect,
  NEXT_DB_LOG,
  NEXT_DB_SSL,
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
  logging: NEXT_DB_LOG === "true" ? console.log : false,
};

if (NEXT_DB_SSL === "true")
  options.dialectOptions = {
    ssl: {
      required: true,
      rejectUnauthorized: false,
    },
  };

export const sequelizeConnection = new Sequelize(
  options.database!,
  options.username!,
  options.password!,
  options
);

const modules = initModels(sequelizeConnection);

export default modules;
