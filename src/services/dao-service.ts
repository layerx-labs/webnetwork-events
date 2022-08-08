import { Network_v2, Web3Connection } from "@taikai/dappkit";
import "dotenv/config";
import logger from "src/utils/logger-handler";

const { CHAIN_RPC: web3Host, CHAIN_PRIVATE_KEY: privateKey } = process.env;
export default class DAOService {
  private _web3Connection: Web3Connection;
  private _network: Network_v2;

  get web3Connection() {
    return this._web3Connection;
  }
  get network() {
    return this._network;
  }

  constructor() {
    this._web3Connection = new Web3Connection({
      web3Host,
      privateKey,
      skipWindowAssignment: true,
    });

    this._web3Connection.start();
  }

  async loadNetwork(networkAddress: string | undefined) {
    try {
      if (!networkAddress)
        throw new Error("Missing Network_v2 Contract Address");

      if (this._network?.contractAddress === networkAddress)
        return this._network;

      const network = new Network_v2(this._web3Connection, networkAddress);

      await network.loadContract();

      this._network = network;

      return network;
    } catch (e) {
      logger.error(`Error loading Network_v2 (${networkAddress}): ${e}`);
    }

    return false;
  }
}