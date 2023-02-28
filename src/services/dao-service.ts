import { Network_v2, Web3Connection } from "@taikai/dappkit";

const {
  NEXT_PUBLIC_WEB3_CONNECTION: rpcHost,
  NEXT_WALLET_PRIVATE_KEY: pKey
} = process.env;

interface DAOServiceProps {
  web3Connection?: Web3Connection;
  web3Host?: string;
  privateKey?: string;
  networkAddress?: string;
}

export default class DAO {
  web3Connection: Web3Connection;
  network: Network_v2;
  networkAddress: string;

  constructor({ web3Connection, web3Host = rpcHost, privateKey = pKey, networkAddress } : DAOServiceProps = {}) {
    if (!web3Host && !web3Connection)
      throw new Error("Missing web3 provider URL or web3 connection");

    if (networkAddress) this.networkAddress = networkAddress;

    this.web3Connection = web3Connection || new Web3Connection({
      web3Host,
      privateKey,
      skipWindowAssignment: true
    });
  }

  async start(): Promise<boolean> {
    try {
      await this.web3Connection.start();

      if (this.networkAddress) {
        this.network = new Network_v2(this.web3Connection, this.networkAddress);
        
        await this.network.loadContract();
      }

      return true;
    } catch (error) {
      console.debug("Error starting: ", error);
    }

    return false;
  }
}