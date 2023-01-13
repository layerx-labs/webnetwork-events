import cors, {CorsOptions} from "cors";
import dotenv from "dotenv";
import express, {Express} from "express";
import {readFileSync} from "fs";
import {createServer} from "https";
import {router} from "src/routes";
import loggerHandler from "./utils/logger-handler";
import {GlobalCatcher} from "./utils/global-catcher";
import "elastic-apm-node/start";

dotenv.config();

GlobalCatcher();

const app: Express = express();
const useSSL = process.env.SSL_ENABLED === "true";

const port = process.env.WEB_EVENTS_PORT ? process.env.WEB_EVENTS_PORT : useSSL ? 8443 : 80;

const corsOptions: CorsOptions = {
  origin: process.env.WEBAPP_URL || `http://localhost`,
  optionsSuccessStatus: 200,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"]
};

app.use(express.json());

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use((req, res, next) => {
  loggerHandler.debug(`Access`, {method: req.method, url: req.url, body: req.body});
  next();
})

app.use((err, req, res, next) => {
  loggerHandler.error(`Access error`, {err, method: req.method, url: req.url, body: req.body});
  res.status(500).send({error: err?.message || `no message`});
});

app.use(router);

const listen = () => {
  loggerHandler.info(`API Listening on ${port} over HTTP${useSSL ? "S" : ""}`);
  loggerHandler.info(`API corsOptions`, corsOptions);
  loggerHandler.info(`API corsOptions`, corsOptions);
}

if (useSSL) {
  const keyPath = process.env.SSL_PRIVATE_KEY_PATH;
  const certPath = process.env.SSL_CERT_PATH;

  if (!keyPath || !certPath) {
    throw Error("Missing SSLKeyPath or SSLCertPath");
  }

  createServer({key: readFileSync(keyPath, "utf8"), cert: readFileSync(certPath, "utf8"),}, app)
    .listen(port, listen);
} else {
  app.listen(port, listen);
}
