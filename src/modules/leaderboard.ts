import { Network_v2 } from "@taikai/dappkit";

import db from "src/db";
import logger from "src/utils/logger-handler";

async function updateLeaderboardRow(address: string, property: string, value: number) {
  const userLeaderboard = await db.leaderboard.findOne({
    where: { address }
  });

  if(userLeaderboard) {
    userLeaderboard[property] = value;

    await userLeaderboard.save();
  } else
    await db.leaderboard.create({
      address,
      [property]: value,
    });
}

async function updateBountiesCreated(creators: string[], network: Network_v2) {
  try {
    for (const creator of creators) {
      const bountiesIds = await network.getBountiesOfAddress(creator);

      const bountiesOpened = bountiesIds.length;

      await updateLeaderboardRow(creator, "ownedBountiesOpened", bountiesOpened);

      logger.info(`Leaderboard: updateBountiesCreated of ${creator} to ${bountiesOpened}`);
    }
  } catch (error) {
    logger.error(`Leaderboard: failed to updateBountiesCreated of ${creators}`, error);
  }
}

async function updateBountiesCanceledOrClosed(creators: string[], network: Network_v2, type: "canceled" | "closed") {
  try {
    for (const creator of creators) {
      const bountiesIds = await network.getBountiesOfAddress(creator);

      const bounties = await Promise.all(bountiesIds.map( id => network.getBounty(id)));

      const bountiesFiltered = bounties.filter(bounty => bounty[type]).length;

      await updateLeaderboardRow(creator, `ownedBounties${type.replace("c", "C")}`, bountiesFiltered);

      logger.info(`Leaderboard: updateBountiesCanceledOrClosed[${type}] of ${creator} to ${bountiesFiltered}`);
    }
  } catch (error) {
    logger.error(`Leaderboard: failed to updateBountiesCanceledOrClosed[${type}] of ${creators}`, error);
  }
}

export {
  updateBountiesCreated,
  updateBountiesCanceledOrClosed
};