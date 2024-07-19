import models from "src/db";
import { notification_settingsAttributes } from "src/db/models/notification_settings";

import logger from "src/utils/logger-handler";

export type NotificationType = keyof Omit<notification_settingsAttributes, "id" | "userId" | "subscriptions">;

type GetUserNotificationSettingsOutput = {
  enabled: boolean,
  notifications: NotificationType[],
  subscriptions: number[],
}

export async function getUserNotificationSettings(userId: number): Promise<GetUserNotificationSettingsOutput> {
  const where = {
    userId: userId
  };

  const userSettings = await models.user_settings.findOne({ where });

  const notificationSettings = await models.notification_settings.findOne({ where, raw: true });

  const notifications: NotificationType[] = [];

  for (const key in notificationSettings) {
    if (["id", "userId", "subscriptions"].includes(key))
      continue;

    if (notificationSettings[key])
      notifications.push(key as NotificationType);
  }

  return {
    enabled: !!userSettings?.notifications,
    subscriptions: notificationSettings?.subscriptions || [],
    notifications,
  }
}

export async function shouldSendNotification( userId: number,
                                              notificationType: NotificationType,
                                              taskId: number): Promise<boolean> {
  try {
    const { enabled, subscriptions, notifications } = await getUserNotificationSettings(userId);

    const isSubscribedToTask = subscriptions.includes(taskId);
    const isNotificationTypeEnabled = enabled && notifications.includes(notificationType);
  
    if (userId === 1) {
      console.log({
        enabled,
        subscriptions,
        notifications,
        isSubscribedToTask,
        isNotificationTypeEnabled,
      })
    }

    return isSubscribedToTask || isNotificationTypeEnabled;

  } catch(error) {
    logger.warn("Failed to verify if should send notification", { error, userId,  notificationType });
  }

  return false;
}