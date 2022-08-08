import express, { Express } from "express";
import dotenv from "dotenv";
import { router } from "src/routes";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3334;

app.use(express.json());

app.use(router);

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
