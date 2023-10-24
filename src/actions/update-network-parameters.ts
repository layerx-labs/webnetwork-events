import db from "src/db";
import logger from "src/utils/logger-handler";
import {EventsProcessed, EventsQuery,} from "src/interfaces/block-chain-service";
import {Network_v2, Web3Connection} from "@taikai/dappkit";
import {Op} from "sequelize";
import {getChainsRegistryAndNetworks} from "../utils/block-process";
import { updateIsCurrentlyCurator } from "src/modules/handle-curators";

export const name = "updateNetworkParameters";
export const schedule = "0 0 * * *";
export const description = "update network parameters on database";
export const author = "Vitor Hugo";

const {NEXT_WALLET_PRIVATE_KEY: privateKey} = process.env;

export async function action(query?: EventsQuery): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};

  logger.info(`${name} start`);

  const entries = await getChainsRegistryAndNetworks();
  for (const [web3Host, {chainId: chain_id,}] of entries) {
    const where = {
      chain_id,
      ...query?.networkName ? {name: {[Op.iLike]: query.networkName}} : {},
    }

    const networks = await db.networks.findAll({
      where,
      include: [{ association: "curators", required: false }],
    });

    try {

      if (!networks || !networks.length) {
        logger.warn(`${name} found no networks`);
        return eventsProcessed;
      }

      const web3Connection = new Web3Connection({web3Host, privateKey});
      await web3Connection.start();

      for (const network of networks) {
        try {
          const networkContract = new Network_v2(web3Connection, network.networkAddress);
          await networkContract.loadContract();

          const contractCouncilAmount = await networkContract.councilAmount()
          
          if(network.councilAmount !== contractCouncilAmount){
            for(const curator of network.curators){
              updateIsCurrentlyCurator(curator, contractCouncilAmount, name)
            }
          }

          network.councilAmount = contractCouncilAmount;
          network.disputableTime = await networkContract.disputableTime();
          network.draftTime = await networkContract.draftTime();
          network.oracleExchangeRate = await networkContract.oracleExchangeRate();
          network.mergeCreatorFeeShare = await networkContract.mergeCreatorFeeShare();
          network.percentageNeededForDispute = await networkContract.percentageNeededForDispute();
          network.cancelableTime = await networkContract.cancelableTime();
          network.proposerFeeShare = await networkContract.proposerFeeShare();

          await network.save();

          eventsProcessed[network.name!] = ["updated"];

          logger.info(`${name} parameters saved ${network.name} ${network.networkAddress}`);
        } catch (error: any) {
          logger.error(`${name} Failed to save parameters of ${network.name} ${network.networkAddress}`, error?.message || error.toString());
        }
      }
    } catch (err: any) {
      logger.error(`${name} Error`, err?.message || err.toString());
    }

  }

  return eventsProcessed;
}
