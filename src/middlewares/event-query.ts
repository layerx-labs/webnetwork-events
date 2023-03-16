import {NextFunction, Request, Response} from "express";

export default function (req: Request, _: Response, next: NextFunction) {
  let {toBlock, fromBlock, networkName, chainId, address, issueId} = req?.query as any;

  if (toBlock && !fromBlock) fromBlock = +toBlock - 1;
  if (fromBlock && !toBlock) toBlock = +fromBlock + 1;

  if ((fromBlock || toBlock) || networkName) {
    req.eventQuery = {
      networkName,
      address,
      chainId,
      bountyQuery: {
        issueId
      },
      blockQuery: {
        from: +fromBlock,
        to: +toBlock,
      },
    };
  }

  next();
}
