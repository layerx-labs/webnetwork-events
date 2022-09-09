import database from "src/db";
import { networksAttributes as NetworkProps } from "src/db/models/networks";
import {
  EventsPerNetwork,
  EventsQuery,
} from "src/interfaces/block-chain-service";
import NetworkService from "src/services/network-service";
import logger from "src/utils/logger-handler";

export default class BlockChainService {
  _eventName: string = "";
  _networkService: NetworkService;
  _networks: NetworkProps[] = [];
  _db; // database instance
  _block = {
    currentBlock: 0, // Latest block mined
    lastBlock: 0, // Last block saved
    totalPages: 1,
    blocksPerPages: 1500,
  };

  get networkService() {
    return this._networkService;
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
      (this._networkService = new NetworkService()),
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
        (await this.networkService.web3Connection.eth.getBlockNumber()) || 0;

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
      (await this?.networkService.web3Connection?.eth?.getBlockNumber()) || 0;

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

  private async _getRegistryAddress(): Promise<string | undefined> {
    const registryAddress = await database.settings.findOne({
      where: {
        key: "networkRegistry",
        group: "contracts",
      },
    });

    return registryAddress?.value;
  }

  /*
    Get events from all networks and last range of blocks processed
  */
  private async _getAllEvents(
    fromRegistry?: boolean
  ): Promise<EventsPerNetwork[]> {
    const allEvents: EventsPerNetwork[] = [];
    const networks = await this._loadAllNetworks();

    for (const network of networks) {
      const event: EventsPerNetwork = {
        network,
        eventsOnBlock: [],
      };

      if (!fromRegistry) {
        if (!(await this.networkService.loadNetwork(network.networkAddress))) {
          logger.error(`Error loading network contract ${network.name}`);
          continue;
        }
      } else {
        const registryAddress = await this._getRegistryAddress();

        if (!registryAddress) throw Error("Missing network registry address");

        if (!(await this.networkService.loadRegistry(registryAddress))) {
          throw Error(
            `Error loading network registry contract ${registryAddress}`
          );
        }
      }

      const { lastBlock, currentBlock, totalPages, blocksPerPages } =
        await this.getChainValues();

      let start = +lastBlock;
      let end = +lastBlock;

      const eventsFinder = fromRegistry
        ? this.networkService.registry
        : this.networkService.network;

      for (let page = 0; page < totalPages; page++) {
        const cursor = start + blocksPerPages;

        end = cursor > currentBlock ? currentBlock : cursor;

        const eventsBlock = await eventsFinder[this._eventName]({
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
  private async _getEvent(
    query: EventsQuery,
    fromRegistry?: boolean
  ): Promise<EventsPerNetwork> {
    const { networkName, blockQuery } = query;
    const networkEvent: EventsPerNetwork = {
      network: {},
      registry: {},
      eventsOnBlock: [],
    };

    const network = await this._getNetwork(networkName);

    networkEvent.network = network;

    if (!fromRegistry) {
      if (!(await this.networkService.loadNetwork(network.networkAddress))) {
        throw Error(`Error loading network contract ${network.name}`);
      }
    } else {
      const registryAddress = await this._getRegistryAddress();

      if (!registryAddress) throw Error("Missing network registry address");
      const registry = await this.networkService.loadRegistry(registryAddress);

      networkEvent.registry = registry;

      if (!registry) {
        throw Error(
          `Error loading network registry contract ${registryAddress}`
        );
      }
    }

    const toBlock = +blockQuery.to;
    const fromBlock = blockQuery.from
      ? +blockQuery.from >= toBlock
        ? toBlock - 1
        : +blockQuery.from
      : toBlock - 1;

    const eventsFinder = fromRegistry
      ? this.networkService.registry
      : this.networkService.network;

    const eventsBlock = await eventsFinder[this._eventName]({
      fromBlock,
      toBlock,
    });

    if (eventsBlock.length) {
      networkEvent.eventsOnBlock = eventsBlock;
    }
    return networkEvent;
  }

  async getEvents(
    query?: EventsQuery,
    fromRegistry?: boolean
  ): Promise<EventsPerNetwork[]> {
    const events: EventsPerNetwork[] = [];

    if (query) {
      events.push(await this._getEvent(query, fromRegistry));
    } else {
      events.push(...(await this._getAllEvents(fromRegistry)));
    }

    return events;
  }

  async getNetworks(query?: EventsQuery): Promise<NetworkProps[]> {
    const networks: NetworkProps[] = [];
    if (query?.networkName) {
      networks.push(await this._getNetwork(query.networkName));
    } else {
      networks.push(...(await this._loadAllNetworks()));
    }

    return networks;
  }
}
