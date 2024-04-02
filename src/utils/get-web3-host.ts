import db from "../db";
import {Op} from "sequelize";

export const getWeb3Host = async (chainId: number) =>
  db.chains.findOne({where: {chainId: {[Op.eq]: chainId}}, raw: true})
    .then(d => ({web3Host: d?.privateChainRpc}))
    .catch(_ => {
      throw new Error(`Failed to find chain`)
    });