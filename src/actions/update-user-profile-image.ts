import { Op, Sequelize, WhereOptions } from "sequelize";

import models from "src/db";
import { generateUserProfileImage } from "src/modules/generate-images/user-profile-image";
import { isIpfsEnvs } from "src/utils/ipfs-envs-verify";
import logger from "src/utils/logger-handler";
import ipfsService from "src/services/ipfs-service";
import { truncateAddress } from "src/utils/string";
import { HttpBadRequestError } from "src/types/errors";

export const name = "update-user-profile-image";
export const schedule = "*/10 * * * *";
export const description = "Generate User profile image for OG";
export const author = "vhcsilva";

export async function action(query?: Record<string, string | boolean>) {
  if (!isIpfsEnvs) {
    logger.warn(`${name} Missing id, secret or baseURL, for IPFService`);
    return;
  }

  if (query?.fromRoute && !query?.id) {
    logger.warn(`${name} Missing query params`, query);
    throw new HttpBadRequestError("Missing query params");
  }

  const where: WhereOptions = {};

  if (query?.id)
    where.id = +query.id;

  const users = await models.users.findAll({
    where
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
      logger.error(`${name} - failed ${user.address}`, {error});
    }
  }
}