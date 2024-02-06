import {Network_v2, Web3Connection} from "@taikai/dappkit";
import logger from "./logger-handler";
import {NETWORK_BOUNTY_NOT_FOUND, NETWORK_NOT_FOUND} from "./messages.const";
import {name} from "../actions/get-bounty-amount-updated-event";
import db from "../db";
import {nativeZeroAddress} from "@taikai/dappkit/dist/src/utils/constants";
import {chainsAttributes} from "../db/models/chains";
import {Op} from "sequelize";

import { DecodedLog } from "src/interfaces/block-sniffer";
import { Sequelize, WhereOptions } from "sequelize";

const {EVENTS_CHAIN_ID} = process.env;

export async function getBountyFromChain(connection: Web3Connection, address, id, name) {
  const actor = new Network_v2(connection, address)
  await actor.loadContract();
  const bounty = await actor.getBounty(+id);
  if (!bounty)
    logger.warn(NETWORK_BOUNTY_NOT_FOUND(name, id, address));

  return bounty;
}

export async function getNetwork(chain_id, address) {
  const network = await db.networks.findOne({
    where: {
      networkAddress: Sequelize.where(Sequelize.fn("LOWER", Sequelize.col("networks.networkAddress")), 
                                      "=",
                                      address.toString().toLowerCase()),
      chain_id
    } as WhereOptions,
    include: [
      { association: "chain" }
    ]
  });


  if (!network)
    logger.error(NETWORK_NOT_FOUND(name, address));

  return network;
}

export async function getChainsRegistryAndNetworks() {

  const chainsReducer = (p, {
    privateChainRpc,
    registryAddress = nativeZeroAddress,
    chainId
  }: chainsAttributes): { [privateChainRpc: string]: { registryAddress: string, chainId: number } } =>
    ({...p, [privateChainRpc!]: {registryAddress, chainId}})

  const where = {
    registryAddress: {[Op.not]: null},
    ...EVENTS_CHAIN_ID ? {chainId: {[Op.eq]: +EVENTS_CHAIN_ID}} : {},
  }

  const chains = await db.chains.findAll({where, raw: true});

  return Promise.all(
    Object.entries(chains.reduce(chainsReducer, {}))
      .map(([rpc, info]) =>
        db.networks.findAll({where: {chain_id: info.chainId, networkAddress: {[Op.not]: ''}}, raw: true})
          .then(networks => networks.map(network => network.networkAddress!))
          .then(networks => [rpc, {
            ...info,
            networks
          }] as ([string, { registryAddress: string, chainId: number, networks: string[] }]))))
}

export function parseLogWithContext(log: DecodedLog) {
  return {
    ...log,
    connection: undefined
  };
}