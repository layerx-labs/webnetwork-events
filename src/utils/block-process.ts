import {Network_v2, Web3Connection} from "@taikai/dappkit";
import logger from "./logger-handler";
import {NETWORK_BOUNTY_NOT_FOUND, NETWORK_NOT_FOUND} from "./messages.const";
import {name} from "../actions/get-bounty-amount-updated-event";
import db from "../db";

export async function getBountyFromChain(connection: Web3Connection, address, id, name) {
  const actor = new Network_v2(connection, address)
  const bounty = await actor.getBounty(+id);
  if (!bounty)
    logger.warn(NETWORK_BOUNTY_NOT_FOUND(name, id, address));

  return bounty;
}

export async function getNetwork(chain_id, address) {
  const network = await db.networks.findOne({where: {networkAddress: address, chain_id}});

  if (!network)
    logger.error(NETWORK_NOT_FOUND(name, address));

  return network;
}