import { Router } from "express";

import { internalApiKey } from "src/middlewares/internal-api-key";
import {  MIDNIGHT_ACTIONS, MINUTE_ACTIONS } from "src/modules/chain-events";
import { BaseAPIError } from "src/types/errors";

const router = Router();

router.use(internalApiKey);

router.get("/:action", async (req, res, next) => {
  const { action } = req.params;
  const handler = MIDNIGHT_ACTIONS[action] || MINUTE_ACTIONS[action];

  if (!handler)
    return res.status(404).json({ message: "Invalid action" });

  try {
    const result = await handler({
      fromRoute: true,
      ...req.query,
    });
  
    return res.status(200).json(result).end();
  } catch (error) {
    if (error instanceof BaseAPIError)
      return res.status(error.status).json({ message: error.message }).end();

    next(error);
  }
});

export default router;