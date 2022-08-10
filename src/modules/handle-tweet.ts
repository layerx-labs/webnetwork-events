import "dotenv/config";
import { formatNumberToNScale } from "src/utils/formatNumber";
import { TwitterApi, TwitterApiTokens } from "twitter-api-v2";

const {
  TWITTER_APIKEY: appKey,
  TWITTER_APIKEY_SECRET: appSecret,
  TWITTER_ACCESS_TOKEN: accessToken,
  TWITTER_ACCESS_SECRET: accessSecret,
} = process.env;
const webAppUrl = process.env.WEBAPP_URL || "http://localhost:3000";

interface TwitterProps {
  type: "bounty" | "proposal";
  action:
    | "created"
    | "changes"
    | "solution"
    | "failed"
    | "distributed"
    | "working";
  issuePreviousState?: string;
  currency?: string;
  username?: string;
  issue: {
    id: string | number;
    repository_id: number;
    title: string;
    amount: number;
    state: string;
    githubId: string;
  };
}

function handleState(currentState: string) {
  switch (currentState) {
    case "draft": {
      return "𝗗𝗥𝗔𝗙𝗧";
    }
    case "open": {
      return "𝗢𝗣𝗘𝗡";
    }
    case "ready": {
      return "𝐑𝐄𝐀𝐃𝐘";
    }
    case "closed": {
      return "𝐂𝐋𝐎𝐒𝐄𝐃";
    }
    case "canceled": {
      return "𝗖𝗔𝗡𝗖𝗘𝗟𝗘𝗗";
    }
    default: {
      return "";
    }
  }
}

export default async function twitterTweet({
  type,
  action,
  issue,
  issuePreviousState,
  username,
  currency = "$TOKEN",
}: TwitterProps) {
  if ([appKey, appSecret, accessToken, accessSecret].some((v) => !v))
    return console.log("Missing Twitter API credentials");

  const twitterClient = new TwitterApi({
    appKey,
    appSecret,
    accessToken,
    accessSecret,
  } as TwitterApiTokens);

  let title = "";
  let body = "";

  issue?.state && (issue.state = handleState(issue.state));
  issuePreviousState && (issuePreviousState = handleState(issuePreviousState));
  const issueTitle =
    issue.title.length > 30 ? issue.title.slice(0, 30) + "..." : issue.title;
  const amount = formatNumberToNScale(issue.amount);

  if (type === "bounty" && action === "created") {
    title = "Alert";
    body = `${issueTitle} and earn up to ${amount} ${currency}`;
  }
  if (type === "bounty" && action === "changes") {
    title = "Status Update";
    body = `${issueTitle} has changed its status from ${
      issuePreviousState && issue.state
        ? `${issuePreviousState} to ${issue.state}`
        : issue.state
    }`;
  }
  if (type === "bounty" && action === "solution") {
    title = "Solution Found";
    body = `${username} has found a solution for the bounty ${issueTitle}`;
  }
  if (type === "bounty" && action === "distributed") {
    title = "Fully Distributed";
    body = `${issueTitle} was closed and fully distributed with ${amount} ${currency}.`;
  }
  if (type === "proposal") {
    title = "Proposal Status";
    body = `A proposal ${
      action === "created" ? `was ${action}` : `has ${action}`
    } regarding the bounty ${issueTitle}`;
  }

  const Tweet = `
  ♾ Protocol Bounty ${title + "!"}

  ${body}
 
  ${webAppUrl}/bounty?id=${issue.githubId}&repoId=${issue.repository_id}
  `;

  if (Tweet.length < 280 && title && body) {
    return await twitterClient.v2
      .tweet(Tweet)
      .then((value) => {
        console.log("Tweet created successfully - tweet ID:", value.data.id);
        return value;
      })
      .catch((err) => {
        console.log("Error creating Tweet ->", err);
      });
  } else {
    console.log(
      "This Tweet cannot be created. Because it contains more than 280 characters"
    );

    return;
  }
}
