import { NextFunction, Request, Response } from "express";
export default function (req: Request, res: Response, next: NextFunction) {
  const { blockTo, blockFrom, networkName } = req?.query as any;
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
