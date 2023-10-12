import db from "src/db";
import logger from "src/utils/logger-handler";
import {EventsProcessed, EventsQuery,} from "src/interfaces/block-chain-service";
import {DecodedLog} from "../interfaces/block-sniffer";
import {NetworkRegistry, fromSmartContractDecimals} from "@taikai/dappkit";
import { UserLockedAmountChangedEvent } from "@taikai/dappkit/dist/src/interfaces/events/network-registry";
import { Sequelize, WhereOptions } from "sequelize";
import BigNumber from "bignumber.js";

export const name = "getUserLockedAmountChangedEvents";
export const schedule = "*/10 * * * *";
export const description = "retrieving user locked amount changed on registry events";
export const author = "MarcusviniciusLsantos";

export async function action(block: DecodedLog<UserLockedAmountChangedEvent['returnValues']>, query?: EventsQuery): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};
  const {returnValues: {user: userAddress, newAmount}, connection, address, chainId} = block;

  const registry = new NetworkRegistry(connection, address);
  await registry.loadContract();

  const contractToken = registry.token
  const newUserAmount = BigNumber(fromSmartContractDecimals(newAmount, registry.token.decimals));

 const dbUser = await db.users.findOne({
    where: {
      address: Sequelize.where(Sequelize.fn("LOWER", Sequelize.col("users.address")), 
      "=",
      userAddress?.toLowerCase())
    } as WhereOptions
  })

  const token = await db.tokens.findOne({
    where: {
      address: Sequelize.where(Sequelize.fn("LOWER", Sequelize.col("tokens.address")), 
      "=",
      contractToken.contractAddress?.toLowerCase())
    } as WhereOptions
  })

  if(!token){
    logger.warn(`${name} Token not found in database`);
    return eventsProcessed
  }

  const [user_locked_registry, created] = await db.users_locked_registry.findOrCreate({
    where: {
      chainId,
      address: Sequelize.where(Sequelize.fn("LOWER", Sequelize.col("users_locked_registry.address")), 
      "=",
      userAddress?.toLowerCase()),
    } as WhereOptions,
    defaults: {
      address: userAddress,
      chainId: chainId,
      userId: dbUser?.id,
      amountLocked: newUserAmount?.toFixed(),
      tokenId: token?.id
    }
  });

  if(user_locked_registry && !created){
    user_locked_registry.amountLocked = newUserAmount?.toFixed(),
    
    await user_locked_registry.save()
  }

  logger.warn(`${name} Registered locked amount changed - address:${userAddress} - chainId:${chainId}`);

  eventsProcessed[userAddress!] = [newUserAmount?.toFixed()]

  return eventsProcessed;
}
