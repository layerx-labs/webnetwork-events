import cors from "cors";
import dotenv from "dotenv";
import express, { Express } from "express";
import { readFileSync } from "fs";
import { createServer } from "https";
import { router } from "src/routes";
dotenv.config();

const app: Express = express();
const port = process.env.WEB_EVENTS_PORT || 3334;

var corsOptions = {
  origin: process.env.WEBAPP_URL || "http://localhost:3334",
  optionsSuccessStatus: 200,
};

app.use(express.json());

app.use(cors(corsOptions));
app.use(router);

if (process.env.SSL_ENABLED === "true") {
  const keyPath = process.env.SSL_PRIVATE_KEY_PATH;
  const certPath = process.env.SSL_CERT_PATH;

  if (!keyPath || !certPath) {
    throw Error("Missing SSLKeyPath or SSLCertPath");
  }

  createServer(
    {
      key: readFileSync(keyPath, "utf8"),
      cert: readFileSync(certPath, "utf8"),
    },
    app
  ).listen(port, () => {
    console.log("Running a secure https server...");
    console.log(`Server is running at HTTPS:${port}`);
  });
} else {
  app.listen(port, () => {
    console.log(`Server is running at HTTP:${port}`);
  });
}
