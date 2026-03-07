import * as Notifications from "expo-notifications";
import dayjs from "dayjs";
import { AlertItem } from "@/types/models";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const requestNotificationPermissions = async (): Promise<boolean> => {
  const permissions = await Notifications.getPermissionsAsync();
  if (permissions.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
};

export const scheduleAlertNotifications = async (alerts: AlertItem[]): Promise<void> => {
  const granted = await requestNotificationPermissions();
  if (!granted) return;

  await Notifications.cancelAllScheduledNotificationsAsync();
  for (const alert of alerts.slice(0, 20)) {
    const triggerDate = dayjs(alert.due_date).hour(9).minute(0).second(0);
    if (triggerDate.isBefore(dayjs())) continue;
    await Notifications.scheduleNotificationAsync({
      content: { title: alert.title, body: alert.message },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerDate.toDate() },
    });
  }
};
