import "dotenv/config";
import db from "src/db";
import { BountiesProcessed } from "src/interfaces/block-chain-service";
import { Bounty } from "src/interfaces/bounties";
import { formatNumberToNScale } from "src/utils/formatNumber";
import loggerHandler from "src/utils/logger-handler";
import { TwitterApi, TwitterApiTokens } from "twitter-api-v2";

const {
  TWITTER_APIKEY: appKey,
  TWITTER_APIKEY_SECRET: appSecret,
  TWITTER_ACCESS_TOKEN: accessToken,
  TWITTER_ACCESS_SECRET: accessSecret,
} = process.env;
const webAppUrl = process.env.WEBAPP_URL || "http://localhost:3000";
interface TwitterProps {
  entity: string;
  event: string;
  networkName: string;
  bountyId: string;
}

function handleState(currentState: string) {
  switch (currentState) {
    case "draft":
      return "𝗗𝗥𝗔𝗙𝗧";
    case "open":
      return "𝗢𝗣𝗘𝗡";
    case "ready":
      return "𝐑𝐄𝐀𝐃𝐘";
    case "closed":
      return "𝐂𝐋𝐎𝐒𝐄𝐃";
    case "canceled":
      return "𝗖𝗔𝗡𝗖𝗘𝗟𝗘𝗗";
    default: {
      return currentState.toUpperCase();
    }
  }
}

const events = {
  bounty: {
    created: {
      title: () => "Alert",
      body: (bounty: Bounty) =>
        `${bounty.title} and earn up to ${bounty.amount} ${bounty?.token?.symbol}`,
    },
    closed: {
      title: () => "Fully Distributed",
      body: (bounty: Bounty) =>
        `${bounty.title} was closed and fully distributed with ${bounty.amount} ${bounty?.token?.symbol}.`,
    },
    updated: {
      title: () => "Status Update",
      body: (bounty: Bounty) =>
        `${bounty.title} has changed its status from ${
          bounty.state ? `𝗗𝗥𝗔𝗙𝗧 to ${bounty.state}` : bounty.state
        }`,
    },
  },
  proposal: {
    created: {
      title: () => "Proposal Status",
      body: (bounty: Bounty) =>
        `A proposal was created regarding the bounty ${bounty.title}`,
    },
    disputed: {
      title: () => "Proposal Status",
      body: (bounty: Bounty) =>
        `A proposal has disputed regarding the bounty ${bounty.title}`,
    },
    refused: {
      title: () => "Proposal Status",
      body: (bounty: Bounty) =>
        `A proposal has refused regarding the bounty ${bounty.title}`,
    },
  },
};

export const mainNetworks = ["bepro", "taikai"];
process.env.NETWORK_NAME &&
  mainNetworks.push(process.env.NETWORK_NAME.toLowerCase());

export async function dispatchTweets(bounties: BountiesProcessed, entity: string, event: string, networkName: string) {
  if (!bounties || !mainNetworks.includes(networkName.toLocaleLowerCase()) || !events?.[entity]?.[event])
    return;

  return await Promise.all(
    Object.values(bounties)
      .filter((item) => item.bounty)
      .map((item) =>
        twitterTweet({
          entity,
          event,
          bountyId: item?.bounty?.issueId as string,
          networkName,
        })
      )
  ).catch(console.error);
}

export default async function twitterTweet({entity, event, bountyId, networkName,}: TwitterProps) {
  if (!bountyId || !mainNetworks.includes(networkName.toLocaleLowerCase()) || !events?.[entity]?.[event])
    return;

  if ([appKey, appSecret, accessToken, accessSecret].some((v) => !v))
    return loggerHandler.warn("Missing Twitter API credentials");

  const bounty = await db.issues.findOne({
    where: { issueId: bountyId },
    include: [{ association: "token" }],
  });

  if (!bounty) return;

  const twitterClient = new TwitterApi({appKey, appSecret, accessToken, accessSecret,} as TwitterApiTokens);

  bounty?.state && (bounty.state = handleState(bounty.state));
  if (bounty.title && bounty.title.length > 29)
    bounty.title = bounty.title.slice(0, 29).concat(`...`);

  bounty?.amount && formatNumberToNScale(+bounty?.amount);

  let title = events[entity][event]?.title();
  let body = events[entity][event]?.body(bounty);

  if (!title || !body) return;

  const Tweet = [
    `♾ Protocol Bounty ${title}!`,
    ``,
    body,
    ``,
    `${webAppUrl}/bounty?id=${bounty.githubId}&repoId=${bounty.repository_id}`
  ].join(`\n`)

  if (Tweet.length < 280 && title && body) {
    return await twitterClient.v2
      .tweet(Tweet)
      .then((value) => {
        loggerHandler.info("Tweet created successfully - tweet ID:", value.data.id);
        return value;
      })
      .catch((err) => {
        loggerHandler.error("Error creating Tweet", err);
      });
  } else {
    loggerHandler.error("This Tweet cannot be created. Because it contains more than 280 characters", Tweet);
    return;
  }
}
