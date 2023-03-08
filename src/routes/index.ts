import {Router} from "express";

import {eventsRouter} from "./events.routes";
import {seoRoutes} from "./seo.routes";

const router = Router();

router.use("/seo", seoRoutes);

router.use("/past-events", eventsRouter);

router.use(`/read/`, readRouter);

router.use("/", async (req, res) => {
  return res.status(200).json("::");
});

export {router};
