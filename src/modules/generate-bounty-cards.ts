import nodeHtmlToImage from "node-html-to-image";
import path from "path";
import BigNumber from "bignumber.js";
import { formatNumberToNScale } from "src/utils/formatNumber";
import { issuesAttributes } from "src/db/models/issues";
import { fontToBase64, imageToBase64, loadHtml } from "src/modules/generate-images/generate-images";

export const lessThenWei = (number: number | string) => number!== 0 && BigNumber(number).isLessThan(0.0001) ? '< 0.0001' : number;

export function image2base64(imagePathName: string) {
  return imageToBase64(path.resolve("src", "assets", "images", imagePathName));
}

export function font2base64(fontPathName: string) {
  return fontToBase64(path.resolve("src", "assets", "fonts", fontPathName));
}

export function importHtml(htmlPathName: string) {
  return loadHtml(path.resolve("src", "assets", "templates", htmlPathName));
}

async function generateImage(issue, symbol, logoName, template) {
  if (!issue) throw new Error("issue is required");

  const background = await image2base64("pattern.png");
  const logo = await image2base64(logoName);
  const font = await font2base64("SpaceGrotesk.ttf");
  const html = (await importHtml(template)) as string;

  const content = {
    id: issue?.id,
    state: issue?.state,
    title: issue?.title,
    amount: lessThenWei(formatNumberToNScale(+BigNumber(issue?.amount))|| 0),
    fundingAmount: lessThenWei(formatNumberToNScale(+BigNumber(issue?.fundingAmount)) || 0),
    fundedAmount: lessThenWei(formatNumberToNScale(+BigNumber(issue?.fundedAmount)) || 0),
    isFudingBounty: BigNumber(issue?.fundingAmount).gt(0),
    working: issue?.working?.length || 0,
    proposals: issue?.merge_proposals?.length || 0,
    deliverables: issue?.deliverables?.length || 0,
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

interface GenerateImageProps {
  issue: issuesAttributes;
  symbol?: string;
}

export default async function generateBountyCards({
  issue,
  symbol = "",
}: GenerateImageProps) {
  return generateImage(issue, symbol, "bepro-icon.png", "seo-bounty-cards.hbs");
}

export async function generateNftImage({
  issue,
  symbol = "",
}: GenerateImageProps) {
  return generateImage(issue, symbol, "bepro-logo.png", "nft.hbs");
}