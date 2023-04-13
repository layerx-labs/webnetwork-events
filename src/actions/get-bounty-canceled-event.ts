import db from "src/db";
import GHService from "src/services/github";
import logger from "src/utils/logger-handler";
import {EventsProcessed, EventsQuery,} from "src/interfaces/block-chain-service";
import {slashSplit} from "src/utils/string";
import {DB_BOUNTY_NOT_FOUND} from "../utils/messages.const";
import {handleBenefactors} from "src/modules/handle-benefactors";
import BigNumber from "bignumber.js";
import {updateLeaderboardBounties} from "src/modules/leaderboard";
import {DecodedLog} from "../interfaces/block-sniffer";
import {getBountyFromChain, getNetwork, parseLogWithContext} from "../utils/block-process";
import {sendMessageToTelegramChannels} from "../integrations/telegram";
import {BOUNTY_STATE_CHANGED} from "../integrations/telegram/messages";
import { pull_requests } from "src/db/models/pull_requests";

export const name = "getBountyCanceledEvents";
export const schedule = "*/11 * * * *";
export const description = "Move to 'Canceled' status the bounty";
export const author = "clarkjoao";

async function closeAndRemovePullRequests(pullRequests: pull_requests[], owner: string, repo: string) {
  for (const pr of pullRequests) {
    await GHService.pullrequestClose(owner, repo, pr.githubId as string);
    await pr.destroy()
  }
}

export async function action(block: DecodedLog, query?: EventsQuery): Promise<EventsProcessed> {

  const eventsProcessed: EventsProcessed = {};
  const {returnValues: {id}, connection, address, chainId} = block;

  const bounty = await getBountyFromChain(connection, address, id, name);
  if (!bounty)
    return eventsProcessed;

  const network = await getNetwork(chainId, address);
  if (!network)
    return eventsProcessed;

  const dbBounty = await db.issues.findOne({
    where: {contractId: block.returnValues.id, issueId: bounty.cid, network_id: network.id,},
    include: [
      {association: "repository"}, 
      {association: "benefactors"}, 
      {association: "network"},
      {association: "pull_requests", required: false},
    ],
  });

  if (!dbBounty) {
    logger.warn(DB_BOUNTY_NOT_FOUND(name, bounty.cid, network.id))
    return eventsProcessed;
  }

  if (!dbBounty.githubId) {
    logger.warn(`${name} Bounty ${bounty.id} missing githubId`, bounty);
    return eventsProcessed
  }
  const fundingAmount = dbBounty?.fundingAmount !== '0' ? dbBounty?.fundingAmount : undefined
  const fundedAmount = dbBounty?.fundedAmount !== '0' ? dbBounty?.fundedAmount : undefined
  const isFunded = BigNumber(fundingAmount || 0).isEqualTo(BigNumber(fundedAmount || 1))
  const isHardCancel = ['open', 'ready'].includes(dbBounty?.state || '') && (dbBounty.fundingAmount === ('0' || undefined) || isFunded)

  if(isHardCancel) {
    const [owner, repo] = slashSplit(dbBounty?.repository?.githubPath);

    if(dbBounty?.pull_requests.length > 0) 
      closeAndRemovePullRequests(dbBounty?.pull_requests, owner, repo)
      
    await GHService.issueClose(repo, owner, dbBounty?.githubId)
    const body = "Governor chose to remove your bounty from listing, please contact governance for more information";
    await GHService.createCommentOnIssue(repo, owner, dbBounty?.githubId, body);
  }


  const [owner, repo] = slashSplit(dbBounty.repository.githubPath);

  await GHService.issueClose(repo, owner, dbBounty.githubId)
    .catch(e => logger.error(`${name} Failed to close ${owner}/${repo}/issues/${dbBounty.githubId}`, e?.message || e.toString()));

  dbBounty.state = `canceled`;

  if (bounty.funding.length > 0) {
    await handleBenefactors(bounty.funding, dbBounty, "delete", name)
    dbBounty.fundedAmount = bounty.funding.reduce((prev, current) => prev.plus(current.amount), BigNumber(0)).toFixed()
  }

  await dbBounty.save();
  sendMessageToTelegramChannels(BOUNTY_STATE_CHANGED(dbBounty.state, dbBounty));

  await updateLeaderboardBounties("canceled");

  eventsProcessed[network.name!] = {
    [dbBounty.issueId!.toString()]: {bounty: dbBounty, eventBlock: parseLogWithContext(block)}
  };


  return eventsProcessed;
}
