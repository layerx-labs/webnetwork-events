import { NextFunction, Request, Response } from "express";
export default function (req: Request, _: Response, next: NextFunction) {
  var { toBlock, fromBlock, networkName, chainId } = req?.query as any;

  if (toBlock && !fromBlock) fromBlock = +toBlock - 1;
  if (fromBlock && !toBlock) toBlock = +fromBlock + 1;

  if ((fromBlock || toBlock) || networkName) {
    req.eventQuery = {
      networkName,
      chainId,
      blockQuery: {
        from: +fromBlock,
        to: +toBlock,
      },
    };
  }

  next();
}
