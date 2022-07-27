import { ERC20 } from "@taikai/dappkit";
import db from "../db/index.js";
import BlockChainService from "../services/block-chain-service.js";
import { error, info } from "../utils/logger-handler.js";

export const name = "getBountyCreatedEvents";
export const schedule = "1 * * * * *";
export const description = "retrieving bounty created events";
export const author = "clarkjoao";

async function validateToken(transactionalToken) {
  var token = await db.tokens.findOne({
    where: {
      address: transactionalToken,
    },
  });

  if (!token?.id) {
    const erc20 = new ERC20(contract?.network?.connection, transactionalToken);

    await erc20.loadContract();

    token = await db.tokens.create({
      name: await erc20.name(),
      symbol: await erc20.symbol(),
      address: transactionalToken,
    });
  }

  return token.id;
}

export async function action() {
  const service = new BlockChainService();
  await service.init(name);

  const events = await service.getAllEvents();

  for (let event of events) {
    const { network, eventsOnBlock } = event;

    try {
      if (!(await service.DAO.loadNetwork(network.networkAddress))) {
        error(`Error loading network contract ${network.name}`);
        continue;
      }

      for (let eventBlock of eventsOnBlock) {
        const { id, cid } = eventBlock.returnValues;

        const bounty = await db.issues.findOne({
          where: {
            issueId: cid,
            network_id: network?.id,
          },
        });

        if (!bounty) {
          error(`Bounty cid: ${cid} not found`);
          continue;
        }

        if (bounty.state !== "pending") {
          error(`Bounty cid: ${cid} already in draft state`);
          continue;
        }

        bounty.state = "draft";

        const networkBounty = await service.DAO?.network?.getBounty(id);

        if (networkBounty) {
          bounty.creatorAddress = networkBounty.creator;
          bounty.creatorGithub = networkBounty.githubUser;
          bounty.amount = networkBounty.tokenAmount;
          bounty.branch = networkBounty.branch;
          bounty.title = networkBounty.title;
          bounty.contractId = id;

          const tokeId = await validateToken(networkBounty.transactional);
          if (tokeId) bounty.token = tokeId;
        }
        await bounty.save();

        info(`Bounty cid: ${cid} created`);
      }
    } catch (err) {
      error(`Error creating bounty cid: ${cid}`, err);
    }
  }
}

action();
