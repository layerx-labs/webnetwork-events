import { Op } from "sequelize";
import db, { sequelizeConnection } from "src/db";
import logger from "src/utils/logger-handler";

export const name = "CalculatePointsDaily";
export const schedule = "0 0 * * *";
export const description = "Calculate total points and update users' total points";
export const author = "Vitor Hugo";

export async function action() {
  logger.info(`${name} start`);

  const events = await db.points_events.findAll({
    where: {
      pointsCounted: false,
    },
    order: ["userId"],
    raw: true
  });

  if (!events?.length) {
    logger.info(`${name} no counted events not found`);
    return;
  }

  const pointsByUser = {} as { [userId: string]: { userId: number, total: number, eventsIds: number[] } };

  for (const event of events) {
    const userPoints = pointsByUser[event.userId] ? { ...pointsByUser[event.userId] } : 
      { userId: event.userId, total: 0, eventsIds: [] };

    userPoints.total += event.pointsWon;
    userPoints.eventsIds.push(event.id);

    pointsByUser[event.userId] = userPoints;
  }

  for (const userPoints of Object.entries(pointsByUser)) {
    const transaction = await sequelizeConnection.transaction();
    try {
      await db.users.update({
        totalPoints: userPoints[1].total
      }, {
        where: {
          id: userPoints[1].userId
        },
        transaction: transaction
      });

      await db.points_events.update({
        pointsCounted: true,
      }, {
        where: {
          id: {
            [Op.in]: userPoints[1].eventsIds
          }
        },
        transaction: transaction
      });

      await transaction.commit();

      logger.info(`${name} updated user points`, userPoints[1]);
    } catch (error) {
      logger.error(`${name} failed to update user points`, userPoints[1], error);
      await transaction.rollback();
    }
  }
}