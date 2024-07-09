import { NextFunction, Request, Response } from "express";

const { NEXT_INTERNAL_API_KEY } = process.env;

const blockedActions = [
  "UpdateUserProfileImage"
];

export function internalApiKey(req: Request, res: Response, next: NextFunction) {
  const isBlockedAction = blockedActions.some(action => req.url.toLowerCase().includes(action.toLowerCase()));

  if (!isBlockedAction) {
    next();
    return;
  }

  const headerKey = req.headers["internal-api-key"];

  if (!headerKey || headerKey !== NEXT_INTERNAL_API_KEY) {
    res.status(403);
    res.end();
    return;
  }

  next();
}