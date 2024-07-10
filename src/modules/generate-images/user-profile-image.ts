import path from "path";
import nodeHtmlToImage from "node-html-to-image";

import { fontToBase64, imageToBase64, loadHtml } from "src/modules/generate-images/generate-images";
import { usersAttributes } from "src/db/models/users";
import { truncateAddress } from "src/utils/string";

const { NEXT_PUBLIC_IPFS_BASE: ipfsBase } = process.env;

interface GenerateUserProfileImageParams {
  user: usersAttributes;
  tasksWon: number;
  tasksOpened: number;
  acceptedProposals: number;
}

const backgroundImagePath = path.resolve("src", "assets", "images", "pattern.png");
const logoImagePath = path.resolve("src", "assets", "images", "bepro-icon.png");
const avatarPlaceholderPath = path.resolve("src", "assets", "images", "avatar-placeholder.png");
const fontPath = path.resolve("src", "assets", "fonts", "SpaceGrotesk.ttf");
const template = path.resolve("src", "assets", "templates", "user-profile.hbs");

export async function generateUserProfileImage({
  user,
  tasksWon,
  tasksOpened,
  acceptedProposals,
}: GenerateUserProfileImageParams) {
  const background = await imageToBase64(backgroundImagePath);
  const logo = await imageToBase64(logoImagePath);
  const avatarPlaceholder = await imageToBase64(avatarPlaceholderPath);
  const font = await fontToBase64(fontPath);
  const html = await loadHtml(template);
  const truncatedAddress = truncateAddress(user?.address);

  let primaryText = truncatedAddress;
  let secondaryText: string | undefined = undefined;

  if (user?.fullName) {
    primaryText = user.fullName.length > 25 ? `${user.fullName.slice(0, 25)}...` : user.fullName;

    if (user?.handle)
      primaryText += ` (${user?.handle})`;
  } else if (user?.handle) {
    primaryText = user?.handle;
    secondaryText = truncatedAddress;
  }

  const content = {
    primaryText,
    secondaryText,
    bio: user?.about,
    avatar: user?.avatar ? `${ipfsBase}/${user?.avatar}` : avatarPlaceholder,
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