import env from '../env';
import type { UserAlert } from '../types/alert';

export async function registerSubscription(subscription: PushSubscription): Promise<void> {
  const resp = await fetch(`${env.PUSH_SERVER_URL}/api/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subscription: subscription.toJSON() }),
  });
  if (!resp.ok) throw new Error('Failed to register push subscription');
}

export async function scheduleAlert(alert: UserAlert, subscription: PushSubscription): Promise<void> {
  const resp = await fetch(`${env.PUSH_SERVER_URL}/api/schedule-alert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      alertId: alert.alertId,
      fireAt: alert.leaveByTime,
      subscription: subscription.toJSON(),
      payload: {
        title: '🚌 Time to go!',
        body: `Leave now — ${alert.routeShortName} from ${alert.stopName}`,
        alertId: alert.alertId,
      },
    }),
  });
  if (!resp.ok) throw new Error('Failed to schedule push alert');
}

export async function cancelAlert(alertId: string): Promise<void> {
  try {
    await fetch(`${env.PUSH_SERVER_URL}/api/schedule-alert/${alertId}`, {
      method: 'DELETE',
    });
  } catch {
    // Ignore errors on cancel — server might not be running
  }
}
