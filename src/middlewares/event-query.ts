import { NextFunction, Request, Response } from "express";
export default function (req: Request, res: Response, next: NextFunction) {
  var { blockTo, blockFrom, networkName } = req?.query as any;

  if (blockTo && !blockFrom) blockFrom = +blockTo - 1;
  if (blockFrom && !blockTo) blockTo = +blockFrom + 1;

  if (blockTo && networkName) {
    req.eventQuery = {
      networkName,
      blockQuery: {
        from: blockFrom,
        to: blockTo,
      },
    };
  }

  next();
}
