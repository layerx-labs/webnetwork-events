import { subHours } from "date-fns";
import { Op, Sequelize } from "sequelize";

import models from "src/db";
import { generateUserProfileImage } from "src/modules/generate-images/user-profile-image";
import { isIpfsEnvs } from "src/utils/ipfs-envs-verify";
import logger from "src/utils/logger-handler";
import ipfsService from "src/services/ipfs-service";
import { truncateAddress } from "src/utils/string";

export const name = "update-user-profile-image";
export const schedule = "*/10 * * * *";
export const description = "Generate User profile image for OG";
export const author = "vhcsilva";

const TTL_IN_HOURS = 1; 

export async function action() {
  if (!isIpfsEnvs) {
    logger.warn(`${name} Missing id, secret or baseURL, for IPFService`);
    return;
  }

  const where = {
    [Op.or]: [
      { 
        profileImage: {
          [Op.eq]: null
        } 
      },
      {
        profileImageUpdatedAt: {
          [Op.lt]: subHours(+new Date(), TTL_IN_HOURS)
        }
      },
      {
        updatedAt: {
          [Op.gt]: Sequelize.col("users.profileImageUpdatedAt")
        }
      }
    ]
  };

  const users = await models.users.findAll({
    where,
    limit: 5,
  });

  if (!users.length) {
    logger.info(`${name} No users to be updated`);
    return;
  }

  for (const user of users) {
    try {
      const tasksWon = await models.issues.count({
        where: {
          state: "closed"
        },
        include: [
          {
            association: "merge_proposals",
            required: true,
            where: {
              contractId: {
                [Op.eq]: Sequelize.cast(Sequelize.col("issues.merged"), "integer")
              }
            },
            include: [
              { 
                association: "deliverable",
                required: true,
                where: {
                  userId: user.id
                }
              }
            ]
          }
        ]
      });
      const tasksOpened = await models.issues.count({
        where: {
          userId: user.id
        }
      });
      const acceptedProposals = await models.merge_proposals.count({
        where: Sequelize.where( Sequelize.fn("LOWER", Sequelize.col("creator")), 
                                "=",
                                user.address?.toLowerCase())
      });

      const card = await generateUserProfileImage({
        address: truncateAddress(user.address!),
        handle: user.handle,
        avatar: user.avatar,
        bio: user.about,
        tasksWon,
        tasksOpened,
        acceptedProposals,
      });

      const { hash } = await ipfsService.add(card);

      if (!hash) {
        logger.warn(`${name} Failed to get hash from IPFS for user profile card ${user.address}`);
        return;
      } else
        await user.update({ 
          profileImage: hash,
          profileImageUpdatedAt: new Date()
        });

      logger.debug(`${name} - profile image updated ${user.address}`);
    } catch(error) {
      console.log("error", error)
    }
  }
}