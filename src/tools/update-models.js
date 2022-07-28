import { execSync } from "child_process";
import "dotenv/config";

const {
  DB_DATABASE: d,
  DB_HOST: h,
  DB_PASSWORD: x,
  DB_PORT: p,
  DB_USERNAME: u,
  DB_DIALECT: dialect,
} = process.env;

if ([d, h, x, p, u].some((v) => !v))
  throw new Error(`Missing database variables`);

const command = `-h ${h} -d ${d} -u ${u} -x ${x} -p ${p} --dialect ${
  dialect || "postgres"
}`;
const commandPaths = `-l esm -o ./db/models/`;

execSync(`npx sequelize-auto ${command} ${commandPaths}`);
