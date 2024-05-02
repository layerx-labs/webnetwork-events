import { Op, Sequelize } from "sequelize";

import db from "src/db";
import logger from "src/utils/logger-handler";

type PointsEvents = "locked" | "delegated" | "created_marketplace" | "created_task" | "created_deliverable" | 
  "created_proposal" | "accepted_proposal";

export async function savePointEvent(event: PointsEvents, participants: string[]) {
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

  const users = await db.users.findAll({
    where: Sequelize.where( Sequelize.fn("lower", Sequelize.col("users.address")),
                            Op.in,
                            Sequelize.literal(`('${(participants).map((s) => s?.toLowerCase()).join("','")}')`))
  });

  if (!users) {
    logger.error(`savePointEvent: users not found for participants ${participants.join(", ")}`);
    return;
  }

  const existingPointsEvents = (await db.points_events.findAll({
    attributes: [
      "userId",
      [Sequelize.literal("COUNT(id)"), "quantity"]
    ],
    group: ["userId"],
    where: {
      userId: {
        [Op.in]: users.map(user => user.id)
      },
      actionName: pointsBase.actionName
    },
    raw: true
  })) as unknown as { userId: number, quantity: string }[];

  for (const participant of participants) {
    const user = users.find(user => user.address?.toLowerCase() === participant.toLowerCase());

    if (!user) {
      logger.error(`savePointEvent: user not found for participant ${participant}`);
      continue;
    }

    const eventsOfUser = existingPointsEvents.find(e => e.userId === user.id);

    if (pointsBase.counter !== "N" && eventsOfUser && +eventsOfUser?.quantity >= +pointsBase.counter ) {
      logger.error(`savePointEvent: action ${pointsBase.actionName} has a limit of ${pointsBase.counter} events and user ${participant} already has ${eventsOfUser.quantity}`);
      continue;
    }

    await db.points_events.create({
      userId: user.id,
      actionName: pointsBase.actionName,
      pointsWon: 
    });
  }
}

savePointEvent("accepted_proposal", ["0xf15CC0ccBdDA041e2508B829541917823222F364", "0x4B37DBe33E012C6707eC691cE911e2930B23474c"]);