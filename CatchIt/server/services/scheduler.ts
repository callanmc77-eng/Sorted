import { sendPushNotification } from './webPush.js';
import type webPush from 'web-push';

interface ScheduledJob {
  alertId: string;
  timer: ReturnType<typeof setTimeout>;
  subscription: webPush.PushSubscription;
  payload: object;
  fireAt: number;
}

const jobs = new Map<string, ScheduledJob>();

export function scheduleJob(
  alertId: string,
  fireAt: number,
  subscription: webPush.PushSubscription,
  payload: object
): void {
  // Cancel existing job for this alert if any
  cancelJob(alertId);

  const delay = fireAt - Date.now();
  if (delay < 0) {
    console.log(`[scheduler] Alert ${alertId} is in the past, skipping`);
    return;
  }

  console.log(`[scheduler] Scheduling alert ${alertId} in ${Math.round(delay / 1000)}s`);

  const timer = setTimeout(async () => {
    console.log(`[scheduler] Firing notification for alert ${alertId}`);
    try {
      await sendPushNotification(subscription, payload);
    } catch (err) {
      console.error(`[scheduler] Failed to send push for ${alertId}:`, err);
    }
    jobs.delete(alertId);
  }, delay);

  jobs.set(alertId, { alertId, timer, subscription, payload, fireAt });
}

export function cancelJob(alertId: string): void {
  const job = jobs.get(alertId);
  if (job) {
    clearTimeout(job.timer);
    jobs.delete(alertId);
    console.log(`[scheduler] Cancelled alert ${alertId}`);
  }
}

export function listJobs(): Array<{ alertId: string; fireAt: number }> {
  return [...jobs.values()].map(j => ({ alertId: j.alertId, fireAt: j.fireAt }));
}
