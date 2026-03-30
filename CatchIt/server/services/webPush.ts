import webPush from 'web-push';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '..', '.env.server');

// Parse .env.server
const envVars: Record<string, string> = {};
try {
  const content = readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const idx = line.indexOf('=');
    if (idx > 0) {
      envVars[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
    }
  });
} catch {
  console.error('Could not read .env.server');
  process.exit(1);
}

webPush.setVapidDetails(
  envVars.VAPID_MAILTO || 'mailto:catchit@example.com',
  envVars.VAPID_PUBLIC_KEY,
  envVars.VAPID_PRIVATE_KEY
);

export async function sendPushNotification(
  subscription: webPush.PushSubscription,
  payload: object
): Promise<void> {
  await webPush.sendNotification(subscription, JSON.stringify(payload));
}

export { webPush };
