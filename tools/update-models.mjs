import { execSync } from "child_process";
import "dotenv/config";

const {
  NEXT_DB_DATABASE: d,
  NEXT_DB_HOST: h,
  NEXT_DB_PASSWORD: x,
  NEXT_DB_PORT: p,
  NEXT_DB_USERNAME: u,
  NEXT_DB_DIALECT: dialect,
} = process.env;

if ([d, h, x, p, u].some((v) => !v))
  throw new Error(`Missing database variables`);

const command = `-h ${h} -d ${d} -u ${u} -x ${x} -p ${p} --dialect ${
  dialect || "postgres"
}`;
const commandPaths = `-l ts --useDefine --schema -o ./src/db/models/`;

execSync(`npx sequelize-auto ${command} ${commandPaths}`);
