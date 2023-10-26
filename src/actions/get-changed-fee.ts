import db from "src/db";
import logger from "src/utils/logger-handler";
import {NetworkRegistry} from "@taikai/dappkit";
import {EventsProcessed, EventsQuery} from "src/interfaces/block-chain-service";
import {ChangedFeeEvent} from "@taikai/dappkit/dist/src/interfaces/events/network-registry";
import {DecodedLog} from "../interfaces/block-sniffer";
import {AnalyticEventName} from "../services/analytics/types/events";
import {Push} from "../services/analytics/push";
import BigNumber from "bignumber.js";

export const name = "getChangedFees";
export const schedule = "*/60 * * * *";
export const description = "Read Changed Fees events of Network_Registry";
export const author = "Vitor Hugo";

export async function action(block: DecodedLog<ChangedFeeEvent['returnValues']>, query?: EventsQuery): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};

  const {returnValues: {closeFee, cancelFee}, connection, address, chainId} = block;

  const registry = new NetworkRegistry(connection, address);
  await registry.loadContract();

  const divisor = await registry.getDivisor();
  const lockAmountForNetworkCreation = await registry.lockAmountForNetworkCreation();
  const networkCreationFeePercentage = await registry.networkCreationFeePercentage();

  const chain = await db.chains.findOne({
    where: {
      chainId: chainId
    }
  });

  if (!chain) {
    logger.error(`${name}: chain with chainId ${chainId} not found in database`);
    return eventsProcessed;
  }

  const closeFeePercentage = BigNumber(closeFee).div(divisor).toNumber();
  const cancelFeePercentage = BigNumber(cancelFee).div(divisor).toNumber();

  chain.lockAmountForNetworkCreation = lockAmountForNetworkCreation;
  chain.networkCreationFeePercentage = networkCreationFeePercentage;
  chain.closeFeePercentage = closeFeePercentage;
  chain.cancelFeePercentage = cancelFeePercentage;

  await chain.save();

  Push.event(AnalyticEventName.CHANGED_FEES, {
    actor: address, lockAmountForNetworkCreation, networkCreationFeePercentage, closeFeePercentage, cancelFeePercentage
  });

  eventsProcessed[address] = [
    `lockAmountForNetworkCreation: ${lockAmountForNetworkCreation}`,
    `networkCreationFeePercentage: ${networkCreationFeePercentage}`,
    `closeFeePercentage: ${closeFeePercentage}`,
    `cancelFeePercentage: ${cancelFeePercentage}`
  ];

  return eventsProcessed;
}

