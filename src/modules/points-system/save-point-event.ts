import { Op, Sequelize } from "sequelize";

import db from "src/db";
import logger from "src/utils/logger-handler";

type PointsEvents = "locked" | "delegated" | "created_marketplace" | "created_task" | "created_deliverable" | 
  "created_proposal" | "accepted_proposal";

export async function savePointEvent( event: PointsEvents, 
                                      participantAddress: string, 
                                      calculateFunction = (pointsPerAction: number, scalingFactor: number) => pointsPerAction * scalingFactor ) {
  const pointsBase = await db.points_base.findOne({
    where: {
      actionName: event
    }
  });

  if (!pointsBase) {
    logger.error(`savePointEvent: points_base not found for ${event} event`);
    return;
  }

  if (pointsBase.counter === "0") {
    logger.error(`savePointEvent: points_base has counter 0 and is disabled`);
    return;
  }

  const user = await db.users.findOne({
    where: Sequelize.where( Sequelize.fn("lower", Sequelize.col("users.address")),
                            Op.eq,
                            Sequelize.literal(`'${participantAddress.toLowerCase()}'`))
  });

  if (!user) {
    logger.error(`savePointEvent: users not found for participants ${user}`);
    return;
  }

  const eventsOfUser = await db.points_events.count({
    where: {
      userId: user.id,
      actionName: pointsBase.actionName
    },
  });

  if (pointsBase.counter !== "N" && eventsOfUser && eventsOfUser>= +pointsBase.counter ) {
    logger.error(`savePointEvent: action ${pointsBase.actionName} has a limit of ${pointsBase.counter} events and user ${participantAddress} already has ${eventsOfUser}`);
    return;
  }

  const newEvent = {
    userId: user.id,
    actionName: pointsBase.actionName,
    pointsWon: calculateFunction(pointsBase.pointsPerAction, pointsBase.scalingFactor || 1),
  };

  await db.points_events.create(newEvent);

  logger.log(`savePointEvent: point event saved`, newEvent);
}