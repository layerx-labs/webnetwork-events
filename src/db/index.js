import "dotenv/config";
import { Sequelize } from "sequelize";
import initModels from "./models/init-models.js";

const {
  DB_DATABASE: database,
  DB_HOST: host,
  DB_PASSWORD: password,
  DB_PORT: port,
  DB_USERNAME: username,
  DB_DIALECT: dialect,
} = process.env;

if ([database, host, password, port, username].some((v) => !v))
  throw new Error(`Missing database variables`);

const con = new Sequelize({
  host,
  port,
  dialect: dialect || "postgres",
  database,
  username,
  password,
});

const modules = initModels(con);

export default modules;
