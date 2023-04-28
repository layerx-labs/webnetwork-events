import db from "src/db";
import logger from "src/utils/logger-handler";
import {ERC20, NetworkRegistry,} from "@taikai/dappkit";
import {EventsProcessed, EventsQuery,} from "src/interfaces/block-chain-service";
import {ChangeAllowedTokensEvent} from "@taikai/dappkit/dist/src/interfaces/events/network-registry";
import {DecodedLog} from "../interfaces/block-sniffer";

export const name = "getChangeAllowedTokensEvents";
export const schedule = "*/60 * * * *";
export const description = "retrieving bounty created events";
export const author = "MarcusviniciusLsantos";

const {NEXT_PUBLIC_WEB3_CONNECTION: web3Host, NEXT_WALLET_PRIVATE_KEY: privateKey} =
  process.env;

export async function action(block: DecodedLog<ChangeAllowedTokensEvent['returnValues']>, query?: EventsQuery): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};

  const {returnValues: {tokens, operation, kind}, connection, address, chainId} = block;

  const registry = new NetworkRegistry(connection, address);
  await registry.loadContract();

  const registryTokens = await registry.getAllowedTokens();

  const dbTokens = await db.tokens.findAll({where: {chain_id: chainId}});

  const isTransactional = kind === "transactional";

  const onRegistry = (address: string) => registryTokens[kind].includes(address);
  const notOnRegistry = (address: string) => !onRegistry(address);
  const onDatabase = (address: string) => tokens.includes(address);

  let result: boolean[] | string[] = [];

  if (operation === "add")
    result = await Promise.all(
      (tokens as unknown as string[])
        .filter(onRegistry)
        .map(async (tokenAddress) => {
          try {
            const erc20 = new ERC20(connection, tokenAddress)
            await erc20.loadContract();

            const [token, created] = await db.tokens.findOrCreate({
              where: {
                address: tokenAddress.toLowerCase(),
                chain_id: chainId
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
              if (isTransactional) token.isTransactional = true
              else if (!isTransactional) token.isReward = true
              token.isAllowed = true;
              await token.save();
            }

            return tokenAddress;
          } catch (e: any) {
            logger.error(`${name} Failed to create ${tokenAddress} in database`, e);
            return '';
          }
        }));
  else if (operation === "remove")
    result = await Promise.all(
      (tokens as unknown as string[])
        .filter(notOnRegistry)
        .filter(onDatabase)
        .map(address => dbTokens.find(t => t.address === address))
        .filter(t => !!t?.id)
        .map(async (token) => {
          let removed = 0
          if (isTransactional) {
            token!.isTransactional = false;
            await db.network_tokens.update({isTransactional: false}, {where: {tokenId: token!.id}})
          }
          if (!isTransactional) {
            token!.isReward = false
            await db.network_tokens.update({isReward: false}, {where: {tokenId: token!.id}})
          }
          if (!token!.isReward && !token!.isTransactional) {
            token!.isAllowed = false;
            removed = await db.network_tokens.destroy({where: {tokenId: token!.id}});

            if (!removed)
              logger.warn(`${name} Failed to remove ${token!.id}`);
          }

          await token!.save();

          return removed > 0;
        })
    )

  eventsProcessed[address] = result.map(n => n.toString());
  return eventsProcessed;
}

