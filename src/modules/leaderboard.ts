import { Sequelize, Op } from "sequelize";

import db from "src/db";
import logger from "src/utils/logger-handler";

async function updateLeaderboardRow(address: string, property: string, value: number) {
  const tableColumns = await db.leaderboard.describe();

  if (!tableColumns.hasOwnProperty(property)) {
    logger.error("updateLeaderboardRow invalid property passed", { property })

    return false;
  }

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

  return true;
}

/**
 * Update leaderboard bounties quantity. If the parameter is not passed it will count all bounties.
 */
async function updateLeaderboardBounties(state: "opened" | "canceled" | "closed" = "opened") {
  try {
    const bountiesOfCreators = await db.issues.findAll({
      group: ["creatorAddress"],
      attributes: ["creatorAddress", [Sequelize.fn("COUNT", "creatorAddress"), "id"]],
      raw: true,
      ... state !== "opened" ? {
        where: {
          state: {
            [Op.eq] : state
          }
        }
      } : {}
    });

    if (!bountiesOfCreators.length) {
      logger.info(`Leaderboard: updateLeaderboardBounties ${state} no bounties found`);
      return;
    }

    const leaderBoardColumnsByState = {
      opened: "ownedBountiesOpened",
      canceled: "ownedBountiesCanceled",
      closed: "ownedBountiesClosed",
    } 

    for (const creator of bountiesOfCreators) {
      const { creatorAddress, id: count } = creator;

      if (await updateLeaderboardRow(String(creatorAddress), leaderBoardColumnsByState[state], count))
        logger.info(`Leaderboard: updateLeaderboardBounties ${state} of ${creatorAddress} to ${count}`);
    }
  } catch (error) {
    logger.error(`Leaderboard: failed to updateLeaderboardBounties ${state}`, error?.toString());
  }
}

/**
 * Update leaderboard proposals quantity. If the parameter is not passed it will count all proposals.
 */
async function updateLeaderboardProposals(state: "created" | "accepted" | "rejected" = "created") {
  try {
    let stateCondition = {};

    if (state === "rejected")
      stateCondition = {
        where: {
          [Op.or]: [{ isDisputed: true }, { refusedByBountyOwner: true }]
        }
      };
    else if (state === "accepted")
      stateCondition = {
        attributes: ["creator", [Sequelize.fn("COUNT", "merge_proposals.id"), "id"]],
        include: [
          { 
            association: "issue",
            where: {
              state: "closed",
              merged: {
                [Op.eq]: Sequelize.cast(Sequelize.col("merge_proposals.contractId"), "varchar")
              }
            },
            attributes: []
          }
        ]
      };

    const proposalsOfCreators = await db.merge_proposals.findAll({
      group: ["creator"],
      attributes: ["creator", [Sequelize.fn("COUNT", "creator"), "id"]],
      raw: true,
      ...stateCondition
    });

    if (!proposalsOfCreators.length) {
      logger.info(`Leaderboard: updateLeaderboardProposals ${state} no proposals found`);
      return;
    }

    const leaderBoardColumnsByState = {
      created: "ownedProposalCreated",
      accepted: "ownedProposalAccepted",
      rejected: "ownedProposalRejected"
    } 

    for (const creatorProposal of proposalsOfCreators) {
      const { creator, id: proposalsCount} = creatorProposal;

      if (await updateLeaderboardRow(creator!, leaderBoardColumnsByState[state], proposalsCount))
        logger.info(`Leaderboard: updateLeaderboardProposals ${state} of ${creator} to ${proposalsCount}`);
    }

  } catch (error) {
    logger.error(`Leaderboard: failed to updateLeaderboardProposals ${state}`, error?.toString());
  }
}

export {
  updateLeaderboardBounties,
  updateLeaderboardProposals
};