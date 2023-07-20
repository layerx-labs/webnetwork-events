import fs from "fs";
import nodeHtmlToImage from "node-html-to-image";
import path from "path";
import BigNumber from "bignumber.js";
import { formatNumberToNScale } from "src/utils/formatNumber";
import { slashSplit } from "src/utils/string";

export const lessThenWei = (number: number | string) => number!== 0 && BigNumber(number).isLessThan(0.0001) ? '< 0.0001' : number;

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

async function generateImage(issue, symbol, logoName, template) {
  if (!issue) throw new Error("issue is required");

  const background = await image2base64("pattern.png");
  const logo = await image2base64(logoName);
  const font = await font2base64("SpaceGrotesk.ttf");
  const html = (await importHtml(template)) as string;

  const content = {
    githubId: issue?.githubId,
    state: issue?.state,
    title: issue?.title,
    repository: issue?.repository?.githubPath || "",
    amount: lessThenWei(formatNumberToNScale(+BigNumber(issue?.amount))|| 0),
    fundingAmount: lessThenWei(formatNumberToNScale(+BigNumber(issue?.fundingAmount)) || 0),
    fundedAmount: lessThenWei(formatNumberToNScale(+BigNumber(issue?.fundedAmount)) || 0),
    isFudingBounty: BigNumber(issue?.fundingAmount).gt(0),
    working: issue?.working?.length || 0,
    proposals: issue?.merge_proposals?.length || 0,
    pullRequests: issue?.pull_requests?.length || 0,
    currency: symbol || issue?.transactionalToken?.symbol,
    background,
    network: issue?.network?.name || "",
    logo,
    font,
  };

  const card = (await nodeHtmlToImage({
    html,
    content,
    type: "jpeg",
    puppeteerArgs: {
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--headless",
        "--disable-gpu",
        "--disable-dev-shm-usage",
      ],
    },
  })) as string;

  return Buffer.from(card);
}

export default async function generateBountyCards(issue, symbol = "") {
  return generateImage(issue, symbol, "bepro-icon.png", "seo-bounty-cards.hbs");
}

export async function generateNftImage(issue, symbol = "") {
  return generateImage(issue, symbol, "bepro-logo.png", "nft.hbs");
}