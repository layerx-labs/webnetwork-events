import { Router } from "express";

const router = Router();

router.use("/", (req, res) => {
  return res.status(200).json("Hello World!");
});

export { router };
