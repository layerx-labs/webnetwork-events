import { ERC20 } from "@taikai/dappkit";
import db from "src/db";
import {
  EventsProcessed,
  EventsQuery,
} from "src/interfaces/block-chain-service";
import BlockChainService from "src/services/block-chain-service";
import logger from "src/utils/logger-handler";

export const name = "getChangeAllowedTokensEvents";
export const schedule = "*/60 * * * *"; // Each 60 minutes
export const description = "retrieving bounty created events";
export const author = "MarcusviniciusLsantos";

export default async function action(
  query?: EventsQuery
): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};

  try {
    logger.info("retrieving change allowed tokens events");

    const service = new BlockChainService();
    await service.init(name);

    const events = await service.getEvents(query);

    logger.info(`found ${events.length} events`);

    for (let event of events) {
      const { network, registry, eventsOnBlock } = event;

      if (!(await service.networkService.loadNetwork(network.networkAddress))) {
        logger.error(`Error loading network contract ${network.name}`);
        continue;
      }

      if (
        !(await service.networkService.loadRegistry(registry.contractAddress))
      ) {
        logger.error(`Error loading registry contract`);
        continue;
      }

      for (let eventBlock of eventsOnBlock) {
        const { tokens, operation, kind } = eventBlock.returnValues;

        const allowedTokens =
          await service.networkService?.registry?.getAllowedTokens();
        const databaseTokens = (await db.tokens.findAll()) || [];

        if (allowedTokens) {
          if (operation === "add") {
            const addTokens = tokens
              ?.map((address) => {
                const valid = allowedTokens?.[kind]?.find(
                  (kindAddress) => kindAddress === address
                );
                if (valid) {
                  const isDatabase = databaseTokens?.find(
                    (token) => token.address === address
                  );
                  if (!isDatabase) return address;
                }
              })
              .filter((v) => v);

            if (addTokens.length > 0) {
              for (const address of addTokens) {
                const erc20 = new ERC20(registry.web3Connection, address);

                await erc20.loadContract();

                const token = {
                  name: await erc20.name(),
                  symbol: await erc20.symbol(),
                  address: address,
                };
                await db.tokens.create({
                  ...token,
                  isTransactional: kind === "transactional" ? true : false,
                });
              }
            }
          } else if (operation === "remove") {
            const removeTokens = tokens
              ?.map((address) => {
                const valid = allowedTokens?.[kind]?.find(
                  (kindAddress) => kindAddress === address
                );
                if (!valid) {
                  const isDatabase = databaseTokens?.find(
                    (token) => token.address === address
                  );
                  if (isDatabase) return address;
                }
              })
              .filter((v) => v);

            if (removeTokens.length > 0) {
              for (const address of removeTokens) {
                const token = await db.tokens.findOne({
                  where: {
                    address: address,
                    isTransactional: kind === "transactional" ? true : false,
                  },
                });

                if (token)
                  await db.network_tokens
                    .destroy({ where: { tokenId: token.id } })
                    .catch(() =>
                      console.log("Error synchronizing token deletion")
                    );
              }
            }
          }
        } else console.warn("Allowed tokens not found in the registry");
      }

      eventsProcessed[network.name!] = [network.networkAddress!];
    }
    if (!query) await service.saveLastBlock();
  } catch (err) {
    logger.error(
      `[ERROR_REGISTRY] Failed to save tokens from past-events`,
      err
    );
  }

  return eventsProcessed;
}
