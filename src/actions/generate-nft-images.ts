import { Op, Sequelize } from "sequelize";

import db from "src/db";

import { generateNftImage } from "src/modules/generate-bounty-cards";

import { getChainsRegistryAndNetworks } from "../utils/block-process";
import { isIpfsEnvs } from "src/utils/ipfs-envs-verify";
import logger from "src/utils/logger-handler";

import ipfsService from "src/services/ipfs-service";

export const name = "generate-nft-images";
export const schedule = "*/10 * * * *";
export const description = "Generate NFT image for open bounties";
export const author = "vhcsilva";

export async function action(issueId?: string) {
  const bountiesProcessed: any[] = [];

  if (!isIpfsEnvs) {
    logger.warn(`${name} Missing id, secret or baseURL, for IPFService`);
    return bountiesProcessed;
  }

  const entries = await getChainsRegistryAndNetworks();
  for (const [, {chainId: chain_id,}] of entries) {
    try {
      logger.info(`${name} start`);

      const dbEvent =
        await db.chain_events
          .findOrCreate({where: {name, chain_id}, defaults: {name, chain_id}})
          .then(([event,]) => event);

      const where = {
        chain_id,
        state: {
          [Op.notIn]: ["draft", "canceled", "pending"]
        },
        fundingAmount: {
          [Op.eq]: Sequelize.col("issues.fundedAmount")
        },
        nftImage: {
          [Op.eq]: null
        }
      }

      const include = [
        {association: "developers"},
        {association: "merge_proposals"},
        {association: "pull_requests"},
        {association: "network"},
        {association: "transactionalToken"},
      ];

      const MAX_NFT_PER_EXECUTION = 5;

      const bounties = await db.issues.findAll({
        where,
        include,
        limit: MAX_NFT_PER_EXECUTION
      });

      if (!bounties.length) {
        logger.info(`${name} No bounties to be updated`);
        return;
      }

      logger.info(`${name} ${bounties.length} bounties to be updated`);

      for (const bounty of bounties) {
        try {
          logger.debug(`${name} Creating NFT to bounty ${bounty.id}`);
          const card = await generateNftImage(bounty);

          const {hash} = await ipfsService.add(card);
          if (!hash) {
            logger.warn(`${name} Failed to get hash from IPFS for ${bounty.id}`);
            continue;
          }

          await bounty.update({ nftImage: hash });

          bountiesProcessed.push({id: bounty.id, hash});

          logger.debug(`${name} Bounty NFT for ${bounty.id} has been updated`);
        } catch (error: any) {
          logger.error(`${name} Error generating NFT for ${bounty.id}`, error);
          continue;
        }
      }

      if (dbEvent?.lastBlock) {
        dbEvent.lastBlock += 1;
        await dbEvent.save();
      }

    } catch (err: any) {
      logger.error(`${name} Error`, err?.message || err.toString());
    }
  }

  return bountiesProcessed;
}
