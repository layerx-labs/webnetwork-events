import database from "src/db";
import { networksAttributes as networkProps } from "src/db/models/networks";
import DAOService from "src/services/dao-service";
import logger from "src/utils/logger-handler";

export interface EventsPerNetwork {
  network: Partial<networkProps>;
  eventsOnBlock: any[];
}
export default class BlockChainService {
  _eventName = "";
  _DAO;
  _networks: networkProps[] = [];
  _db;
  _block = {
    currentBlock: 0, // Latest block mined
    lastBlock: 0, // Last block saved
    totalPages: 1,
    blocksPerPages: 1500,
  };

  get DAO() {
    return this._DAO;
  }

  get networks() {
    return this._networks;
  }

  get db() {
    return this._db;
  }

  get block() {
    return this._block;
  }

  async init(name: string) {
    this._eventName = name;
    return await Promise.all([
      (this._DAO = new DAOService()),
      this._findNetworks(),
      this._instaceDB(name),
    ]);
  }

  async _findNetworks() {
    const networks = await database.networks.findAll({ raw: true });
    this._networks = networks;
  }

  async _instaceDB(name: string) {
    let instance = await database.chain_events.findOne({
      where: { name },
    });

    if (!instance) {
      const lastBlock =
        (await this.DAO.web3Connection.eth.getBlockNumber()) || 0;

      instance = await database.chain_events.create({
        name,
        lastBlock,
      });
    }

    this._db = instance;
    return instance;
  }

  async _getChainValues() {
    const blocksPerPages = 1500;

    const currentBlock =
      (await this?.DAO.web3Connection?.eth?.getBlockNumber()) || 0;

    const lastBlock = +(await this._db?.lastBlock) || 0;

    const totalPages =
      Math.ceil((currentBlock - lastBlock) / blocksPerPages) || 1;

    const values = { currentBlock, lastBlock, totalPages, blocksPerPages };
    this._block = values;

    return values;
  }

  async getAllEvents(): Promise<EventsPerNetwork[]> {
    const allEvents: EventsPerNetwork[] = [];

    for (const network of this.networks) {
      const event: EventsPerNetwork = {
        network,
        eventsOnBlock: [],
      };

      if (!(await this.DAO.loadNetwork(network.networkAddress))) {
        logger.error(`Error loading network contract ${network.name}`);
        continue;
      }
      debugger;
      const { lastBlock, currentBlock, totalPages, blocksPerPages } =
        await this._getChainValues();

      let start = +lastBlock;
      let end = +lastBlock;

      for (let page = 0; page < totalPages; page++) {
        const cursor = start + blocksPerPages;

        end = cursor > currentBlock ? currentBlock : cursor;
        debugger;
        const eventsBlock = await this.DAO.network[this._eventName]({
          fromBlock: start,
          toBlock: end,
        });

        if (eventsBlock.length) {
          event.eventsOnBlock = eventsBlock;
        }
      }

      allEvents.push(event);
      if (end > 0) {
        this._block.lastBlock = end;
      }
    }

    return allEvents;
  }

  async saveLastBlock(block = 0) {
    const lastBlock = +block || this.block.lastBlock;
    this._db.update({ lastBlock });
  }
}
