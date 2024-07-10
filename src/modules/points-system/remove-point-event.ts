import models from "src/db";
import logger from "src/utils/logger-handler";

export async function removePointEntry(pointEntryId: number) {
  const pointEntry = await models.points_events.findOne({
    where: {
      id: pointEntryId
    }
  });

  if (!pointEntry) {
    logger.warn(`removePointEntry: Entry with id ${pointEntryId} not found on points_events`);
    return;
  }

  if (pointEntry.pointsCounted) {
    const user = await models.users.findOne({
      where: {
        id: pointEntry.userId
      }
    });

    if (!user) {
      logger.warn(`removePointEntry: User with id ${pointEntry.userId} not found`);
      return;
    }

    user.totalPoints = user.totalPoints! - pointEntry.pointsWon;

    await user.save();
  }

  await pointEntry.destroy();

  logger.info(`PointsEvents ${pointEntryId} removed ${pointEntry.pointsCounted ? "and user totalPoints updated" : ""}`);
}