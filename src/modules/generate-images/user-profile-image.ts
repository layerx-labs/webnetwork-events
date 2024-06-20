import path from "path";
import nodeHtmlToImage from "node-html-to-image";

import { fontToBase64, imageToBase64, loadHtml } from "src/modules/generate-images/generate-images";

const { NEXT_PUBLIC_IPFS_BASE: ipfsBase } = process.env;

interface GenerateUserProfileImageParams {
  address: string;
  handle?: string;
  avatar?: string;
  bio?: string;
  tasksWon: number;
  tasksOpened: number;
  acceptedProposals: number;
}

const backgroundImagePath = path.resolve("src", "assets", "images", "pattern.png");
const logoImagePath = path.resolve("src", "assets", "images", "bepro-icon.png");
const fontPath = path.resolve("src", "assets", "fonts", "SpaceGrotesk.ttf");
const template = path.resolve("src", "assets", "templates", "user-profile.hbs");

export async function generateUserProfileImage({
  address,
  handle,
  avatar,
  bio,
  tasksWon,
  tasksOpened,
  acceptedProposals,
}: GenerateUserProfileImageParams) {
  const background = await imageToBase64(backgroundImagePath);
  const logo = await imageToBase64(logoImagePath);
  const font = await fontToBase64(fontPath);
  const html = await loadHtml(template);

  const content = {
    address,
    handle,
    avatar: avatar ? `${ipfsBase}/${avatar}` : logo,
    bio,
    tasksWon,
    tasksOpened,
    acceptedProposals,
    background,
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