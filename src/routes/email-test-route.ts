import {Router} from "express";
import {Push} from "../services/analytics/push";
import {AnalyticEventName} from "../services/analytics/types/events";
import db from "../db";
import process from "process";

const router = Router();

router.get(`/:task`, async (req, res) => {

  if (!process.env.TEST_EMAIL)
    return res.status(400).json({message: "not enabled"})

  const {task} = req.params;
  const bounty = await db.issues.findOne({where: {contractId: +task}});

  if (!bounty)
    return res.status(400).json({message: "nok"});

  await Push.event(+bounty?.fundingAmount! > 0 ? AnalyticEventName.FUNDING_REQUEST_CREATED : AnalyticEventName.BOUNTY_CREATED, {
    currency: bounty.transactionalToken?.symbol,
    reward: bounty.rewardToken?.symbol,
    bountyId: bounty.id,
    bountyChainId: bounty.id,
    title: bounty.title,
  })

  return res.status(200).json({"message": "ok"})
});

export default router;