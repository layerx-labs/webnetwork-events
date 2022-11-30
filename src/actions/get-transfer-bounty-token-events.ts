import db from "src/db";
import logger from "src/utils/logger-handler";
import {
  BountyToken,
  NetworkRegistry,
  Network_v2,
  Web3Connection,
} from "@taikai/dappkit";
import {
  EventsProcessed,
  EventsQuery,
} from "src/interfaces/block-chain-service";
import { leaderboardAttributes } from "src/db/models/leaderboard";
import loggerHandler from "src/utils/logger-handler";

export const name = "getTransferEvents";
export const schedule = "*/60 * * * *";
export const description = "retrieving bounty token transfer events";
export const author = "MarcusviniciusLsantos";

const { PUBLIC_WEB3_CONNECTION: web3Host, WALLET_PRIVATE_KEY: privateKey } =
  process.env;

export async function action(query?: EventsQuery): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};

  const settings = await db.settings.findAll({
    where: { visibility: "public" },
    raw: true,
  });

  if(!settings) logger.warn(`${name} Failed missing settings`);

  const networkRegistry = settings.find(({ key }) => key === "networkRegistry");

  if (!networkRegistry) {
    logger.warn(`${name} Failed missing network registry`);
  } else {

    try {
      const web3Connection = new Web3Connection({ web3Host, privateKey });
      await web3Connection.start();

      const registry = new NetworkRegistry(web3Connection, networkRegistry.value);
      await registry.loadContract();
  
      let lastReadBlock = await db.chain_events.findOne({
        where: { name: name },
      });

      const network = await db.networks.findOne({
        where: { isRegistered: true, name: query?.networkName },
        raw: true,
      });

      if (!network) {
        loggerHandler.warn(`${name} network not found`);
        return eventsProcessed;
      }
      const _network = new Network_v2(web3Connection, network.networkAddress);
      await _network.loadContract();

      const _bountyToken = new BountyToken(web3Connection, registry.bountyToken.contractAddress);
      await _bountyToken.loadContract();

      const fromBlock =
        query?.blockQuery?.from || lastReadBlock!.lastBlock || 0;
      const toBlock =
        query?.blockQuery?.to || (await web3Connection.eth.getBlockNumber());

      const TransferEvents = await _bountyToken.getTransferEvents({
        fromBlock,
        toBlock,
      });

      for (const transferEvent of TransferEvents) {
        const { to, tokenId } = transferEvent.returnValues;

        let result: leaderboardAttributes = {
          address: "",
          id: 0,
          numberNfts: 0,
        };

        const userLeaderboard = await db.leaderboard.findOne({
          where: { address: to },
        });

        const nftToken = await _bountyToken.getBountyToken(tokenId);
        const balance = await _bountyToken.balanceOf(to);

        if (userLeaderboard && nftToken && balance) {
          userLeaderboard.numberNfts = balance;
          result = await userLeaderboard.save();
        } else if (!userLeaderboard && nftToken && balance) {
          result = await db.leaderboard.create({
            address: to,
            numberNfts: balance,
          });
        }

        eventsProcessed[query?.networkName || "0"] = result
          ? [result.address]
          : [];
      }
    } catch (err: any) {
      logger.error(`${name} Error`, err?.message || err.toString());
    }
  }

  return eventsProcessed;
}
