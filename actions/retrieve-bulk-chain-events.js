import "dotenv/config";
import db from "../db/index.js";
import events from "../modules/retrieve-bulk-actions/index.js";
import DAOService from "../services/dao-service.js";
import logger from "../utils/logger-handler.js";

export const name = "retrieve-bulk-chain-events";
export const schedule = "30 * * * * *";
export const description = "retrieving bulk chain events";
export const author = "clarkjoao";

async function retriveEvents(network, contract, fromBlock, toBlock) {
  const arrEvents = Object.keys(events).map(async (action) => {
    logger.info(
      `Retrieving ${action} events from block ${fromBlock} to ${toBlock} at ${network.name}`
    );

    const eventsBlock = await contract.network[action]({
      fromBlock,
      toBlock,
    });

    if (eventsBlock.length)
      return await events[action](eventsBlock, network, contract);

    return [];
  });

  Promise.all(arrEvents).then((res) => {
    console.log("done", res);
  });
}

export async function action() {
  logger.info("Starting retrieving bulk chain events");

  const networks = await db.networks.findAll();
  const contract = new DAOService();

  for (const network of networks) {
    if (!network.name) return;

    const bulk = await db.chain_events.findOne({ where: { name: `Bulk` } });

    const fromBlock =
      +bulk?.dataValues?.lastBlock || +process.env.BULK_CHAIN_START_BLOCK || 0;

    const atBlock = await contract.web3Connection.eth.getBlockNumber();

    if (!atBlock) {
      logger.error("No block found");
      continue;
    }
    if (fromBlock >= atBlock) {
      logger.error("No new block found");
      continue;
    }
    if (!(await contract.loadNetwork(network.networkAddress))) {
      logger.error(`Error loading network contract ${network.name}`);
      continue;
    }

    logger.info(`Retrieving events for network ${network.name}`);

    // paginate blocks
    const blocksPerPages = 1500;
    const totalPages = Math.ceil((atBlock - fromBlock) / blocksPerPages);

    // blocks to be covered
    let blockStart = +fromBlock;
    let currentBlock = 0;

    for (let currentPage = 1; currentPage <= totalPages; currentPage++) {
      const nextCursor = fromBlock + blocksPerPages;

      if (currentBlock === 0) currentBlock = atBlock;

      await retriveEvents(network, contract, blockStart, currentBlock);

      currentBlock = nextCursor > atBlock ? atBlock : nextCursor;

      blockStart += blocksPerPages;
    }
  }
}
