import database from "src/db";
import { networksAttributes as NetworkProps } from "src/db/models/networks";
import {
  EventsPerNetwork,
  EventsQuery,
} from "src/interfaces/block-chain-service";
import DAOService from "src/services/dao-service";
import logger from "src/utils/logger-handler";

export default class BlockChainService {
  _eventName = "";
  _DAO: DAOService;
  _networks: NetworkProps[] = [];
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
      this._instaceDB(name),
    ]);
  }

  private async _loadAllNetworks(): Promise<NetworkProps[]> {
    const networks = await database.networks.findAll({ raw: true });
    this._networks = networks;
    return networks;
  }

  private async _instaceDB(name: string) {
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

  async getChainValues() {
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

  async saveLastBlock() {
    const lastBlock = this.block.lastBlock;
    if (lastBlock > 0) this._db.update({ lastBlock });
  }

  /*
    Get events from all networks and last range of blocks processed
  */
  private async _getAllEvents(): Promise<EventsPerNetwork[]> {
    const allEvents: EventsPerNetwork[] = [];
    const networks = await this._loadAllNetworks();

    for (const network of networks) {
      const event: EventsPerNetwork = {
        network,
        eventsOnBlock: [],
      };

      if (!(await this.DAO.loadNetwork(network.networkAddress))) {
        logger.error(`Error loading network contract ${network.name}`);
        continue;
      }

      const { lastBlock, currentBlock, totalPages, blocksPerPages } =
        await this.getChainValues();

      let start = +lastBlock;
      let end = +lastBlock;

      for (let page = 0; page < totalPages; page++) {
        const cursor = start + blocksPerPages;

        end = cursor > currentBlock ? currentBlock : cursor;

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

  private async _getNetwork(networkName: string): Promise<NetworkProps> {
    let network = this.networks.find((network) => network.name === networkName);

    if (!network) {
      const dbNetwork = await database.networks.findOne({
        where: { name: networkName },
        raw: true,
      });

      if (!dbNetwork) throw Error(`Network ${networkName} not found`);

      network = dbNetwork;
      this._networks.push(network);
    }
    return network;
  }

  /*
    Get events from a specific network and especifc range of blocks
  */
  private async _getEvent(query: EventsQuery): Promise<EventsPerNetwork> {
    const { networkName, blockQuery } = query;
    const networkEvent: EventsPerNetwork = {
      network: {},
      eventsOnBlock: [],
    };

    const network = await this._getNetwork(networkName);

    networkEvent.network = network;

    if (!(await this.DAO.loadNetwork(network.networkAddress))) {
      throw Error(`Error loading network contract ${network.name}`);
    }
    const toBlock = +blockQuery.to;
    const fromBlock = blockQuery.from
      ? +blockQuery.from >= toBlock
        ? toBlock - 1
        : +blockQuery.from
      : toBlock - 1;

    const eventsBlock = await this.DAO.network[this._eventName]({
      fromBlock,
      toBlock,
    });

    if (eventsBlock.length) {
      networkEvent.eventsOnBlock = eventsBlock;
    }
    return networkEvent;
  }

  async getEvents(query?: EventsQuery): Promise<EventsPerNetwork[]> {
    const events: EventsPerNetwork[] = [];

    if (query) {
      events.push(await this._getEvent(query));
    } else {
      events.push(...(await this._getAllEvents()));
    }

    return events;
  }
}
