import db from "src/db";
import logger from "src/utils/logger-handler";
import {ERC20, XEvents} from "@taikai/dappkit";
import {EventsProcessed, EventsQuery,} from "src/interfaces/block-chain-service";
import {EventService} from "../services/event-service";
import {ChangeAllowedTokensEvent} from "@taikai/dappkit/dist/src/interfaces/events/network-registry";

export const name = "getChangeAllowedTokensEvents";
export const schedule = "*/60 * * * *"; // every hour
export const description = "retrieving bounty created events";
export const author = "MarcusviniciusLsantos";

export async function action(query?: EventsQuery): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};

  try {

    const service = new EventService(name, query, true);

    const processor = async (block: XEvents<ChangeAllowedTokensEvent>, network) => {
      const {tokens, operation, kind} = block.returnValues;
      const dbTokens = await db.tokens.findAll();

      const onDatabase = (token) => tokens.includes(token.address);
      const notOnDatabase = (token) => !dbTokens.some((t) => t.address === token);

      let result: number[]|string[] = [];

      if (operation === "add")
        result = await Promise.all(
          tokens
            .filter(notOnDatabase)
            .map(async (tokenAddress) => {
              try {
                const erc20 = new ERC20(network.connection, tokenAddress)
                await erc20.loadContract();
                await db.tokens.create({
                  name: await erc20.name(),
                  symbol: await erc20.symbol(),
                  address: tokenAddress,
                  isTransactional: kind === "transactional"
                });

                return tokenAddress;
              } catch (e) {
                logger.warn(`Failed to create ${tokenAddress} in database`, e);
                return;
              }
            }));
      else if (operation === "remove")
        result = await Promise.all(
          tokens
            .filter(onDatabase)
            .map(address => dbTokens.find(t => t.address === address))
            .map(async (token) => {
              const removed = await db.network_tokens.destroy({where: {tokenId: token.id}});
              if (!removed)
                logger.info(`Failed to remove ${token.id}`);
              return removed > 0;
            })
        )

      eventsProcessed[network.name] = [...eventsProcessed[network.name] as string[], ...result.map(n => n.toString())];
    }

    await service.processEvents(processor);

  } catch (err) {
    logger.error(`Failed to parse ${name}`, err);
  }

  return eventsProcessed;
}
