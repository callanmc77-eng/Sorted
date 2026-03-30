import { Router, Request, Response } from 'express';
import { scheduleJob, cancelJob, listJobs } from '../services/scheduler.js';
import type webPush from 'web-push';

const router = Router();

// Store push subscriptions (in-memory; swap for DB in production)
const subscriptions = new Map<string, webPush.PushSubscription>();

// POST /api/subscribe — register a push subscription
router.post('/subscribe', (req: Request, res: Response) => {
  const { subscription } = req.body as { subscription: webPush.PushSubscription };
  if (!subscription?.endpoint) {
    res.status(400).json({ error: 'Invalid subscription' });
    return;
  }
  // Key by endpoint
  subscriptions.set(subscription.endpoint, subscription);
  console.log(`[push] Registered subscription: ${subscription.endpoint.slice(0, 50)}...`);
  res.json({ ok: true });
});

// POST /api/schedule-alert — schedule a push notification
router.post('/schedule-alert', (req: Request, res: Response) => {
  const { alertId, fireAt, subscription, payload } = req.body as {
    alertId: string;
    fireAt: number;
    subscription: webPush.PushSubscription;
    payload: object;
  };

  if (!alertId || !fireAt || !subscription || !payload) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  scheduleJob(alertId, fireAt, subscription, payload);
  res.json({ ok: true, alertId, fireAt });
});

// DELETE /api/schedule-alert/:alertId — cancel a scheduled alert
router.delete('/schedule-alert/:alertId', (req: Request, res: Response) => {
  cancelJob(req.params.alertId);
  res.json({ ok: true });
});

// GET /api/jobs — list active scheduled jobs (for debugging)
router.get('/jobs', (_req: Request, res: Response) => {
  res.json(listJobs());
});

export default router;
