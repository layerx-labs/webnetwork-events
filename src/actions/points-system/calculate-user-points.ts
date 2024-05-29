import { Op } from "sequelize";
import db from "src/db";
import { CHAIN_IDS } from "src/utils/constants";
import logger from "src/utils/logger-handler";

export const name = "CalculatePointsDaily";
export const schedule = "0 0 * * *";
export const description = "Calculate total points and update users' total points";
export const author = "Vitor Hugo";

const { EVENTS_CHAIN_ID } = process.env;

export async function action() {
  if (!!EVENTS_CHAIN_ID && +EVENTS_CHAIN_ID !== CHAIN_IDS.polygon) {
    logger.info(`${name} skipped because is not events polygon instance`, EVENTS_CHAIN_ID);
    return;
  }

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

  const users = await db.users.findAll();

  try {
    await Promise.all(updateUserPoints.map(item => db.users.update({
      totalPoints: item.total + (users.find(user => user.id === +item.id)?.totalPoints || 0)
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