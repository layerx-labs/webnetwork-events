import cors from "cors";
import dotenv from "dotenv";
import express, { Express } from "express";
import { router } from "src/routes";
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3334;

var corsOptions = {
  origin: process.env.WEBAPP_URL || "http://localhost:3333",
  optionsSuccessStatus: 200,
};

app.use(express.json());

app.use(cors(corsOptions));
app.use(router);

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
