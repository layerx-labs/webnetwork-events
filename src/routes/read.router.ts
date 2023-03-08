import {Router} from "express";
import db from "../db";
import {Op} from "sequelize";
import {NETWORK_EVENTS, REGISTRY_EVENTS} from "../modules/chain-events";
import NetworkRegistry from "@taikai/dappkit/dist/build/contracts/NetworkRegistry.json";
import NetworkV2 from "@taikai/dappkit/dist/build/contracts/NetworkV2.json";
import {findOnABI} from "../utils/find-on-abi";
import {BlockSniffer} from "../services/block-sniffer";

const router = Router();

router.get(`/:chainId/:address/:event`, async (req, res) => {
  const {chainId, address, event} = req.params;
  const {from, to} = req.eventQuery?.blockQuery!;

  const chainIdExists = await db.chains.findOne({where: {chainId: {[Op.eq]: +chainId}}, raw: true});
  if (!chainIdExists)
    return res.status(400).json({message: `unknown chain ${chainId}`});

  const _registryKeys = Object.keys(REGISTRY_EVENTS);
  const _networkKeys = Object.keys(NETWORK_EVENTS)
  const _keys = [..._networkKeys, ..._registryKeys];

  if (!_keys.includes(event))
    return res.status(400).json({message: `unknown event ${event}`});

  let knownAddress;
  const abi: any[] = [];
  const events = {};

  if (_registryKeys.includes(event)) {
    knownAddress = chainIdExists?.registryAddress === address; // only one registry per chain, no need to query db again
    abi.push(findOnABI(NetworkRegistry.abi, event));
    events[event] = REGISTRY_EVENTS[event];
  } else if (_networkKeys.includes(event)) {
    knownAddress = await db.networks.findOne({
      where: {
        networkAddress: {[Op.eq]: address},
        chain_id: {[Op.eq]: +chainId}
      }, raw: true
    });
    abi.push(findOnABI(NetworkV2.abi, event));
    events[event] = NETWORK_EVENTS[event];
  }

  if (!knownAddress)
    return res.status(400).json({message: `unknown network or registry ${address}`})

  new BlockSniffer(chainIdExists.chainRpc, {[address]: {abi, events}}, from, to, req.eventQuery)

})