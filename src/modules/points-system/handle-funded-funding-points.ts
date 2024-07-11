import { Bounty } from "@taikai/dappkit";
import { Op, Sequelize } from "sequelize";

import models from "src/db";
import { issuesAttributes } from "src/db/models/issues";
import { usersAttributes } from "src/db/models/users";

import { savePointEvent } from "src/modules/points-system/save-point-event";
import { removePointEntry } from "src/modules/points-system/remove-point-event";
import { getOrUpdateLastTokenPrice } from "src/modules/tokens";

import logger from "src/utils/logger-handler";

interface HandleFundedFundingPointsProps {
  bounty: Bounty;
  issue: issuesAttributes;
}

type FundingEventInfo = {
  taskId: number,
  benefactorId: number,
  amount: string;
  tokenPrice: number;
}

const {
  NEXT_PUBLIC_CURRENCY_MAIN: currency = "eur",
} = process.env;

export async function handleFundedFundingPoints({
  bounty,
  issue,
}: HandleFundedFundingPointsProps) {
  try {
    const pointsEventsOfIssue = await models.points_events.findAll({
      where: {
        actionName: "funded_funding_request",
        info: {
          taskId: {
            [Op.eq]: issue.id
          }
        }
      }
    });
  
    const users: usersAttributes[] = [];
    const findUser = (address: string) => users.find(user => user?.address?.toLowerCase() === address.toLowerCase());
  
    const benefactors = bounty.funding.map((funding, id) => ({ id, ...funding }));
    for (const benefactor of benefactors) {
      let user = findUser(benefactor.benefactor);
  
      if (!user) {
        const found = await models.users.findOne({
          where: Sequelize.where( Sequelize.fn("LOWER", Sequelize.col("address")), 
                                  "=",
                                  benefactor.benefactor.toLowerCase())
        });
  
        if (!found)
          continue;
  
        user = found;
        users.push(found);
      }
  
      const hasPointEvent = pointsEventsOfIssue
        .find(({ userId, info }) => (info as FundingEventInfo)?.benefactorId === benefactor.id && userId === user?.id);
  
      if (!hasPointEvent && +benefactor.amount > 0) {
        const tokenPrice = await getOrUpdateLastTokenPrice(issue.transactionalTokenId!, currency);
        await savePointEvent("funded_funding_request", user.address!, {
          taskId: issue.id,
          benefactorId: benefactor.id,
          amount: benefactor.amount,
          tokenPrice
        }, (pointsPerAction, scalingFactor) => pointsPerAction * scalingFactor * +benefactor.amount * tokenPrice);

        logger.info(`handleFundedFundingPoints: point saved`, {
          taskId: issue.id,
          benefactorId: benefactor.id,
          amount: benefactor.amount,
          tokenPrice
        });
      } else if (hasPointEvent && +benefactor.amount === 0)
        await removePointEntry(hasPointEvent.id);
        logger.info(`handleFundedFundingPoints: point removed because fund was retracted`, {
          taskId: issue.id,
          benefactorId: benefactor.id,
          amount: benefactor.amount,
        });
    }
  } catch(error) {
    logger.error(`handleFundedFundingPoints: failed to handle funded funding points`, { error, bounty, issue });
  }
}