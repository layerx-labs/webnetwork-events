import db from "src/db";
import logger from "src/utils/logger-handler";
import {ERC20,} from "@taikai/dappkit";
import {EventsProcessed, EventsQuery,} from "src/interfaces/block-chain-service";
import {EventService} from "../services/event-service";
import {ChangeAllowedTokensEvent} from "@taikai/dappkit/dist/src/interfaces/events/network-registry";
import {BlockProcessor} from "../interfaces/block-processor";

export const name = "getChangeAllowedTokensEvents";
export const schedule = "*/60 * * * *";
export const description = "retrieving bounty created events";
export const author = "MarcusviniciusLsantos";

export async function action(query?: EventsQuery): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};

  try {

    const service = new EventService(name, query, true);

    const processor: BlockProcessor<ChangeAllowedTokensEvent> = async (block, network) => {
      const {tokens, operation, kind} = block.returnValues as any;
      const dbTokens = await db.tokens.findAll();

      const onDatabase = (address) => tokens.includes(address);
      const notOnDatabase = (token) => !dbTokens.some((t) => t.address === token);

      let result: number[]|string[] = [];

      if (operation === "add")
        result = await Promise.all(
          tokens
            .filter(notOnDatabase)
            .map(async (tokenAddress) => {
              try {
                const erc20 = new ERC20(service.web3Connection, tokenAddress)
                await erc20.loadContract();
                await db.tokens.create({
                  name: await erc20.name(),
                  symbol: await erc20.symbol(),
                  address: tokenAddress,
                  isTransactional: kind === "transactional"
                });

                return tokenAddress;
              } catch (e) {
                logger.warn(`${name} Failed to create ${tokenAddress} in database`, e);
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
                logger.warn(`${name} Failed to remove ${token.id}`);
              return removed > 0;
            })
        )

      eventsProcessed[network.name] = result.map(n => n.toString());
    }

    await service._processEvents(processor);

  } catch (err) {
    logger.error(`${name} Error`, err);
  }

  return eventsProcessed;
}
