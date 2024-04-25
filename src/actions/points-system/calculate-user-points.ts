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
    logger.info(`${name} no uncounted events found`);
    return;
  }

  const pointsByUser = {} as { [userId: string]: { total: number, eventsIds: number[] } };

  for (const event of events) {
    if (!pointsByUser[event.userId])
      pointsByUser[event.userId] = { total: 0, eventsIds: [] };

    pointsByUser[event.userId].total += event.pointsWon;
    pointsByUser[event.userId].eventsIds.push(event.id);
  }

  const updateUserPoints = Object.entries(pointsByUser).map(([id, { total }]) => ({ id, total }));
  const parsedEventsIds = Object.values(pointsByUser).map(({ eventsIds }) => eventsIds).flat();

  try {
    await Promise.all(updateUserPoints.map(item => db.users.update({
      totalPoints: item.total
    }, {
      where: {
        id: item.id
      }
    })));
  
    await db.points_events.update({
      pointsCounted: true,
    }, {
      where: {
        id: {
          [Op.in]: parsedEventsIds
        }
      }
    });
  
  
    logger.info(`${name} updated user points`, updateUserPoints);
  } catch(error) {
    logger.error(`${name} failed to update user points`, updateUserPoints, error);
  }
}