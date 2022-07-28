import "dotenv/config";
import { create } from "ipfs-http-client";
const {
  IPFS_PROJECT_ID: id,
  IPFS_PROJECT_SECRET: secret,
  IPFS_BASE: url,
} = process.env;

const client = create({
  url,
  headers: {
    authorization:
      "Bearer " + Buffer.from(id + ":" + secret).toString("base64"),
  },
});

export default client;
