import db from "src/db";
import logger from "src/utils/logger-handler";
import { BountyToken, NetworkRegistry, Web3Connection, XEvents } from "@taikai/dappkit";
import {
  EventsProcessed,
  EventsQuery,
} from "src/interfaces/block-chain-service";
import { leaderboardAttributes } from "src/db/models/leaderboard";

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

  if (!settings) logger.warn(`${name} Failed missing settings`);

  const networkRegistry = settings.find(({ key }) => key === "networkRegistry");

  if (!networkRegistry) {
    logger.warn(`${name} Failed missing network registry`);
  } else {
    try {
      const web3Connection = new Web3Connection({ web3Host, privateKey });
      await web3Connection.start();

      const registry = new NetworkRegistry(
        web3Connection,
        networkRegistry.value
      );
      await registry.loadContract();

      let lastReadBlock = await db.chain_events.findOne({
        where: { name: name },
      });

      const _bountyToken = new BountyToken(
        web3Connection,
        registry.bountyToken.contractAddress
      );
      await _bountyToken.loadContract();

      const paginateRequest = async (pool, name: string) => {
        const startBlock = query?.blockQuery?.from || lastReadBlock!.lastBlock || 0;;
        const endBlock = query?.blockQuery?.to || (await web3Connection.eth.getBlockNumber());;
        const perRequest = +(process.env.EVENTS_PER_REQUEST || 1500);
        const requests = Math.ceil((startBlock - endBlock) / perRequest);
    
        let toBlock = 0;
    
        console.log(`Fetching ${name} total of ${requests}, from: ${startBlock} to ${endBlock}`);
        for (let fromBlock = startBlock; fromBlock < endBlock; fromBlock += perRequest) {
          toBlock = fromBlock + perRequest > endBlock ? endBlock : fromBlock + perRequest;
    
          console.log(`${name} fetch from ${fromBlock} to ${toBlock}`);
          pool.push(await _bountyToken.getTransferEvents({fromBlock, toBlock}));
        }
      }
    
      const AllTransferEvents: any = [];
        
      await paginateRequest(AllTransferEvents, `getTransferEvents`)

      for (const TransferEvents of AllTransferEvents) {
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

          //TODO: values returned by this function are wrong in dappkit
          const nftToken: any = await _bountyToken.getBountyToken(tokenId);

          if (nftToken?.bountyId) {
            const bountyDb = await db.issues.findOne({
              where: { contractId: nftToken?.bountyId },
              include: [{ association: "network" }],
            });

            const balance = await _bountyToken.balanceOf(to);

            if (userLeaderboard && balance) {
              userLeaderboard.numberNfts = balance;
              result = await userLeaderboard.save();
            } else if (!userLeaderboard && balance) {
              result = await db.leaderboard.create({
                address: to,
                numberNfts: balance,
              });
            }

            eventsProcessed[bountyDb?.network?.name || "0"] = result
              ? [result.address]
              : [];
          }
        }
      }
    } catch (err: any) {
      logger.error(`${name} Error`, err?.message || err.toString());
    }
  }

  return eventsProcessed;
}
