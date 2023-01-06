import { Network_v2 } from "@taikai/dappkit";
import { Sequelize } from "sequelize";

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

/**
 * Update leaderboard bounties quantity. If the parameter is not passed it will count all bounties.
 */
async function updateLeaderboardBounties(state?: "canceled" | "closed") {
  try {
    const bountiesOfCreators = await db.issues.findAll({
      group: ["creatorAddress"],
      attributes: ["creatorAddress", [Sequelize.fn("COUNT", "creatorAddress"), "id"]],
      raw: true,
      ... state ? {
        where: {
          state
        }
      } : {}
    })

    if (!bountiesOfCreators.length) return logger.info(`Leaderboard: updateLeaderboardBounties ${state} no bounties found`);

    const leaderBoardColumnsByState = {
      opened: "ownedBountiesOpened",
      canceled: "ownedBountiesCanceled",
      closed: "ownedBountiesClosed",
    } 

    for (const creator of bountiesOfCreators) {
      const { creatorAddress, id: bountiesCount} = creator;

      await updateLeaderboardRow(creatorAddress!, leaderBoardColumnsByState[state || "opened"], bountiesCount);

      logger.info(`Leaderboard: updateLeaderboardBounties ${state} of ${creatorAddress} to ${bountiesCount}`);
    }
  } catch (error) {
    logger.error(`Leaderboard: failed to updateLeaderboardBounties ${state}`, error);
  }
}

async function updateProposalCreated(creators: string[], network: Network_v2) {
  try {
    
  } catch (error) {
    logger.error(`Leaderboard: failed to updateBountiesCanceledOrClosed[] of ${creators}`, error);
  }
}

export {
  updateLeaderboardBounties
};