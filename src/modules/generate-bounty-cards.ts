import fs from "fs";
import nodeHtmlToImage from "node-html-to-image";
import path from "path";
import { slashSplit } from "src/utils/string";

function image2base64(imagePathName: string) {
  return new Promise((resolve) => {
    const filePath = path.resolve("src", "assets", "images", imagePathName);
    const file = fs.readFileSync(filePath);
    const base64 = Buffer.from(file).toString("base64");
    resolve(`data:image/png;base64,${base64}`);
  });
}

function font2base64(fontPathName: string) {
  return new Promise((resolve) => {
    const filePath = path.resolve("src", "assets", "fonts", fontPathName);
    const file = fs.readFileSync(filePath);
    const base64 = Buffer.from(file).toString("base64");
    resolve(`data:font/ttf;base64,${base64}`);
  });
}

function importHtml(htmlPathName: string) {
  return new Promise((resolve) => {
    const filePath = path.resolve("src", "assets", "templates", htmlPathName);
    const file = fs.readFileSync(filePath, { encoding: "utf8" });
    resolve(file);
  });
}

export default async function generateBountyCards(issue) {
  if (!issue) throw new Error("issue is required");

  const background = await image2base64("pattern.png");
  const logo = await image2base64("bepro-icon.png");
  const font = await font2base64("SpaceGrotesk.ttf");
  const html = (await importHtml("seo-bounty-cards.hbs")) as string;

  const content = {
    githubId: issue?.githubId,
    state: issue?.state,
    title: issue?.title,
    repository: slashSplit(issue?.repository?.githubPath)[1] || "",
    amount: new Intl.NumberFormat("en").format(issue?.amount || 0),
    working: issue?.working?.length || 0,
    proposals: issue?.merge_proposals?.length || 0,
    pullRequests: issue?.pull_requests?.length || 0,
    currency: issue?.token?.symbol,
    background,
    logo,
    font,
  };

  const card = (await nodeHtmlToImage({
    html,
    content,
    type: "jpeg",
  })) as string;

  return Buffer.from(card);
}
