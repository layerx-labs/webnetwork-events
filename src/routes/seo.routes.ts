import { Router } from "express";
import db from "src/db";

const seoRoutes = Router();

seoRoutes.get("/", async (req, res) => {
  const { issueId } = req.query;

  if (!issueId)
    return res.status(400).json({
      message: "Missing IssueId",
    });

  const bounty = await db.issues.findOne({
    where: {
      id: issueId as string,
    },
  });

  if (!bounty?.seoImage) return res.status(404).json(null);

  return res.status(200).json(bounty?.seoImage);
});

export { seoRoutes };
