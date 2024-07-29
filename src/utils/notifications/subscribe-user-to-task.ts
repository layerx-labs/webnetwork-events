import { Sequelize, WhereOptions } from "sequelize";

import models from "src/db";
import logger from "src/utils/logger-handler";

export async function subscribeUserToTask(taskId: number, userAddress: string) {
  const where: WhereOptions = {
    address: Sequelize.where(Sequelize.fn("lower", Sequelize.col("address")), userAddress?.toLowerCase()),
  };

  const user = await models.users.findOne({ where });

  if (!user) {
    logger.warn(`Failed to subscribeUserToTask: user not found`, { taskId, userAddress });
    return;
  }

  const task = await models.issues.findOne({
    where: {
      id: taskId
    }
  });

  if (!task) {
    logger.warn(`Failed to subscribeUserToTask: task not found`, { taskId, userAddress });
    return;
  }

  const settings = await models.notification_settings.findOne({
    where: {
      userId: user.id
    }
  });

  
  if (!settings?.subscriptions) {
    logger.warn(`Failed to subscribeUserToTask: notification settings not found`, { taskId, userAddress });
    return;
  }

  if (!settings.subscriptions.includes(taskId))
    await settings.update({
      subscriptions: [...settings.subscriptions, taskId]
    });
}