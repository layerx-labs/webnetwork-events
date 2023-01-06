import { Sequelize, Op } from "sequelize";

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
    });

    if (!bountiesOfCreators.length) 
      return logger.info(`Leaderboard: updateLeaderboardBounties ${state} no bounties found`);

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

/**
 * Update leaderboard proposals quantity. If the parameter is not passed it will count all proposals.
 */
async function updateLeaderboardProposals(state?: "accepted" | "rejected") {
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
        attributes: ["creator", [Sequelize.fn("COUNT", "issue.id"), "id"]],
        include: [
          { 
            association: "issue",
            where: {
              state: "closed"
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

    if (!proposalsOfCreators.length) 
      return logger.info(`Leaderboard: updateLeaderboardProposalCreated ${state} no bounties found`);

    const leaderBoardColumnsByState = {
      created: "ownedProposalCreated",
      accepted: "ownedProposalAccepted",
      rejected: "ownedProposalRejected"
    } 

    for (const creatorProposal of proposalsOfCreators) {
      const { creator, id: proposalsCount} = creatorProposal;

      await updateLeaderboardRow(creator!, leaderBoardColumnsByState[state || "created"], proposalsCount);

      logger.info(`Leaderboard: updateLeaderboardBounties ${state} of ${creator} to ${proposalsCount}`);
    }

  } catch (error) {
    logger.error(`Leaderboard: failed to updateLeaderboardProposalCreated ${state}`, error);
  }
}

export {
  updateLeaderboardBounties,
  updateLeaderboardProposals
};