import db from "src/db";
import logger from "src/utils/logger-handler";
import {EventsProcessed, EventsQuery,} from "src/interfaces/block-chain-service";
import {getCoinPrice} from "src/services/coingecko";
import BigNumber from "bignumber.js";
import {Op} from "sequelize";
import { addMinutes } from "date-fns";
import { updateBountiesHeader, updateNumberOfNetworkHeader, updatePriceHeader } from "src/modules/handle-header-information";

export const name = "getPricesHeaderInformation";
export const schedule = "*/15 * * * *";
export const description = "";
export const author = "MarcusviniciusLsantos";

const {
  HEADER_TTL_MINUTES: headerTtl,
} = process.env;

export async function action(query?: EventsQuery): Promise<EventsProcessed> {
  const eventsProcessed: EventsProcessed = {};
  logger.info(`${name} start`);

  try {
    const currentHeader = await db.header_information.findOne();

    if (currentHeader && addMinutes(new Date(currentHeader?.updatedAt), +(headerTtl || 0)) < new Date())
      return eventsProcessed;

    await updatePriceHeader();
    await updateBountiesHeader();
    await updateNumberOfNetworkHeader();

    eventsProcessed['header-information'] = ["processed"];

    logger.info(`${name} processed`)
  } catch (err: any) {
    logger.error(`${name} Error`, err);
  }

  return eventsProcessed;
}
