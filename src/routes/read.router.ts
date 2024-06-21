import {Router} from "express";
import NetworkRegistry from "@taikai/dappkit/dist/build/contracts/NetworkRegistry.json";
import NetworkV2 from "@taikai/dappkit/dist/build/contracts/NetworkV2.json";
import db from "../db";
import eventQuery from "../middlewares/event-query";
import {Op} from "sequelize";
import {MIDNIGHT_ACTIONS, MINUTE_ACTIONS, NETWORK_EVENTS, REGISTRY_EVENTS} from "../modules/chain-events";
import {findOnABI} from "../utils/find-on-abi";
import {ApiBlockSniffer} from "src/services/api-block-sniffer";

const router = Router();

router.use(eventQuery);

router.get(`/:chainId/:address/:event`, async (req, res) => {
  const {chainId, address, event} = req.params;
  const {from, to} = req.eventQuery?.blockQuery || {};

  if (!from && !to) {
    return res.status(400).json({message: `missing from-to params`});
  }

  const chainIdExists = await db.chains.findOne({where: {chainId: {[Op.eq]: +chainId}}, raw: true});
  if (!chainIdExists)
    return res.status(400).json({message: `unknown chain ${chainId}`});

  const _registryKeys = Object.keys(REGISTRY_EVENTS);
  const _networkKeys = Object.keys(NETWORK_EVENTS);
  const _standaloneKeys = Object.keys({...MIDNIGHT_ACTIONS, ...MINUTE_ACTIONS});
  const _keys = [..._networkKeys, ..._registryKeys, ..._standaloneKeys];

  if (!_keys.includes(event))
    return res.status(400).json({message: `unknown event ${event}`});

  let knownAddress;
  const abi: any[] = [];
  const events = {};

  if (_registryKeys.includes(event)) {
    knownAddress = chainIdExists?.registryAddress?.toLowerCase() === address?.toLowerCase(); // only one registry per chain, no need to query db again
    abi.push(findOnABI(NetworkRegistry.abi, event));
    events[event] = REGISTRY_EVENTS[event];
  } else if (_networkKeys.includes(event) || _standaloneKeys.includes(event)) {
    knownAddress = await db.networks.findOne({
      where: {
        networkAddress: {[Op.iLike]: address},
        chain_id: {[Op.eq]: +chainId}
      }, raw: true
    });

    if (_networkKeys.includes(event)) {
      abi.push(findOnABI(NetworkV2.abi, event));
      events[event] = NETWORK_EVENTS[event];
    }
  }

  if (!knownAddress)
    return res.status(400).json({message: `unknown network or registry ${address}`});

  if (_standaloneKeys.includes(event))
    (MIDNIGHT_ACTIONS[event] || MINUTE_ACTIONS[event])({ chainId, address })
      .then(data => {
        res.status(200).json([data]).end();
      });
  else
    (new ApiBlockSniffer(chainIdExists.privateChainRpc!, {[address?.toLowerCase()]: {abi, events}}, from, to))
      .onParsed()
      .then(data => {
        res.status(200).json(data).end();
      });
})

export default router;