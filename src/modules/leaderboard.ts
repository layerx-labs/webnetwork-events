import {Op, Sequelize} from "sequelize";

import db from "src/db";
import logger from "src/utils/logger-handler";

const { EVENTS_CHAIN_ID: chainId } = process.env;

async function updateLeaderboardRow(address: string, property: string, value: number) {
  const tableColumns = await db.leaderboard.describe();

  if (!tableColumns.hasOwnProperty(property)) {
    logger.error("updateLeaderboardRow invalid property passed", { property })

    return false;
  }

  if(address) {
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
  } else {
    logger.error("updateLeaderboardRow invalid address passed")
    
    return false;
  }

  return true;
}

async function updateLeaderboardNfts() {
  const name = `updateLeaderboardNfts`;
  logger.info(name);

  try {
    const distributions = await db.proposal_distributions.findAll({
      group: ["recipient"],
      attributes: ["recipient", [Sequelize.fn("COUNT", "proposal.id"), "id"]],
      include: [
        {
          association: "proposal",
          attributes: [],
          required: true,
          include: [
            {
              association: "issue",
              attributes: [],
              required: true,
              where: {
                state: "closed",
                merged: {
                  [Op.eq]: Sequelize.cast(Sequelize.col("proposal.contractId"), "varchar")
                }
              }
            }
          ]
        }
      ]
    })

    if (distributions.length === 0) {
      logger.warn(name, `no proposal distributions found`);
      return;
    }

    for(const distribution of distributions){
      const { recipient, id: nfts } = distribution
      if (await updateLeaderboardRow(recipient, 'numberNfts', nfts))
        logger.info(name, `updated ${recipient} to numberNfts: ${nfts}`);     
    }

  } catch (error) {
    logger.error(name, `failed`, error);
  }
}

/**
 * Update leaderboard bounties quantity. If the parameter is not passed it will count all bounties.
 */
async function updateLeaderboardBounties(state: "opened" | "canceled" | "closed" = "opened") {
  const name = `updateLeaderboardBounties(${state})`;

  try {
    const bountiesOfCreators = await db.issues.findAll({
      group: ["creatorAddress"],
      attributes: ["creatorAddress", [Sequelize.fn("COUNT", "creatorAddress"), "id"]],
      raw: true,
      ...state !== "opened" ? {
        where: {
          state: {
            [Op.eq] : state
          },
          chain_id: chainId
        }
      } : {}
    });

    if (!bountiesOfCreators.length) {
      logger.warn(name, `no bounties found`);
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
        logger.info(name, `updated ${creatorAddress} to ${count}`);
    }
  } catch (error) {
    logger.error(name, `failed`, error);
  }
}

/**
 * Update leaderboard proposals quantity. If the parameter is not passed it will count all proposals.
 */
async function updateLeaderboardProposals(state: "created" | "accepted" | "rejected" = "created") {
  const name = `updateLeaderboardProposals(${state})`;
  logger.info(name);
  try {
    let stateCondition = {};

    if (state === "rejected")
      stateCondition = {
        where: {
          [Op.or]: [{ isDisputed: true }, { refusedByBountyOwner: true }]
        },
        include: [
          { 
            association: "issue",
            where: {
              chain_id: chainId
            },
            attributes: []
          }
        ]
      };
    else if (state === "accepted")
      stateCondition = {
        attributes: ["creator", [Sequelize.fn("COUNT", "merge_proposals.id"), "id"]],
        include: [
          { 
            association: "issue",
            where: {
              chain_id: chainId,
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
      logger.warn(name, `no proposals found`);
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
        logger.info(name, `updated ${creator} to ${proposalsCount}`);
    }

  } catch (error) {
    logger.error(name, error);
  }
}

export {
  updateLeaderboardBounties,
  updateLeaderboardProposals,
  updateLeaderboardNfts
};