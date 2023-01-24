import db from "src/db";
import logger from "src/utils/logger-handler";
import {ERC20, NetworkRegistry, Web3Connection,} from "@taikai/dappkit";
import {EventsProcessed, EventsQuery,} from "src/interfaces/block-chain-service";
import {EventService} from "../services/event-service";
import {ChangeAllowedTokensEvent} from "@taikai/dappkit/dist/src/interfaces/events/network-registry";
import {BlockProcessor} from "../interfaces/block-processor";
import { getRegistryAddressDb } from "src/modules/get-registry-database";

export const name = "getChangeAllowedTokensEvents";
export const schedule = "*/60 * * * *";
export const description = "retrieving bounty created events";
export const author = "MarcusviniciusLsantos";

const { PUBLIC_WEB3_CONNECTION: web3Host, WALLET_PRIVATE_KEY: privateKey } =
  process.env;

export async function action(query?: EventsQuery): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};
  const service = new EventService(name, query, true);

  const processor: BlockProcessor<ChangeAllowedTokensEvent> = async (block, network) => {
    const {tokens, operation, kind} = block.returnValues as any;
  
    const networkRegistry = await getRegistryAddressDb()

    if (!networkRegistry) logger.warn(`${name} Failed missing network registry on database`);
    else { 
      const web3Connection = new Web3Connection({ web3Host, privateKey });
      await web3Connection.start();

      const registry = new NetworkRegistry(
        web3Connection,
        networkRegistry
      );
      await registry.loadContract();

      const registryTokens = await registry.getAllowedTokens()

      const dbTokens = await db.tokens.findAll();

      const isTransactional = kind === "transactional";

      const onRegistry = (address: string) => registryTokens[isTransactional ? "transactional" : "reward"].includes(address)
      const notOnRegistry = (token) => !registryTokens[isTransactional ? "transactional" : "reward"].some(a => a === token)
      const onDatabase = (address: string) => tokens.includes(address);

      let result: number[]|string[] = [];

      if (operation === "add")
        result = await Promise.all(
          tokens
            .filter(onRegistry)
            .map(async (tokenAddress) => {
              try {
                const erc20 = new ERC20(service.web3Connection, tokenAddress)
                await erc20.loadContract();

                const [token, created] = await db.tokens.findOrCreate({
                  where: {
                    address: tokenAddress
                  },
                  defaults: {
                    name: await erc20.name(),
                    symbol: await erc20.symbol(),
                    isAllowed: true,
                    address: tokenAddress,
                    isTransactional,
                    isReward: !isTransactional
                  }
                });

                if (!created) {
                  if(isTransactional) token.isTransactional = true
                  if(!isTransactional) token.isReward = true
                  token.isAllowed = true;
                  await token.save();
                }

                return tokenAddress;
              } catch (e: any) {
                logger.warn(`${name} Failed to create ${tokenAddress} in database`, e?.message || e.toString());
                return;
              }
            }));
      else if (operation === "remove")
        result = await Promise.all(
          tokens
            .filter(notOnRegistry)
            .filter(onDatabase)
            .map(address => dbTokens.find(t => t.address === address))
            .map(async (token) => {
              if(isTransactional) token.isTransactional = false;
              if(!isTransactional) token.isReward = false
              if(!token.isReward && !token.isTransactional) token.isAllowed = false;
              await token.save();

              const removed = await db.network_tokens.destroy({where: {tokenId: token.id}});

              if (!removed)
                logger.warn(`${name} Failed to remove ${token.id}`);

              return removed > 0;
            })
        )

      eventsProcessed[network?.name || '0'] = result.map(n => n.toString());
    }
  }

  await service._processEvents(processor);

  return eventsProcessed;
}
