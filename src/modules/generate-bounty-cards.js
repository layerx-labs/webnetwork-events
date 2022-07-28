import fs from "fs";
import nodeHtmlToImage from "node-html-to-image";
import path from "path";
import { ghPathSplit } from "../utils/string";

function image2base64(imagePathName) {
  return new Promise((resolve) => {
    const filePath = path.resolve("assets", "images", imagePathName);
    const file = fs.readFileSync(filePath);
    const base64 = new Buffer.from(file).toString("base64");
    resolve(`data:image/png;base64,${base64}`);
  });
}

function font2base64(fontPathName) {
  return new Promise((resolve) => {
    const filePath = path.resolve("assets", "fonts", fontPathName);
    const file = fs.readFileSync(filePath);
    const base64 = new Buffer.from(file).toString("base64");
    resolve(`data:font/ttf;base64, ${base64}`);
  });
}

function importHtml(htmlPathName) {
  return new Promise((resolve) => {
    const filePath = path.resolve("assets", "templates", htmlPathName);
    const file = fs.readFileSync(filePath, { encoding: "utf8" });
    resolve(file);
  });
}

export default async function generateBountyCards(issue) {
  if (!issue) throw new Error("issue is required");

  const background = await image2base64("bg-bounty-card.png");
  const logo = await image2base64("bepro-icon.png");
  const font = await font2base64("SpaceGrotesk.ttf");
  const html = await importHtml("seo-bounty-cards.hbs");

  const content = {
    githubId: issue?.githubId,
    state: issue?.state,
    title: issue?.title,
    repository: ghPathSplit(issue?.repository?.githubPath)[1] || "",
    amount: new Intl.NumberFormat("en").format(issue?.amount || 0),
    working: issue?.working?.length || 0,
    proposals: issue?.merge_proposals?.length || 0,
    pullRequests: issue?.pull_requests?.length || 0,
    currency: issue?.token?.symbol,
    background,
    logo,
    font,
  };

  const card = await nodeHtmlToImage({
    html,
    content,
    type: "jpeg",
  });

  return Buffer.from(card).toString("base64");
}
