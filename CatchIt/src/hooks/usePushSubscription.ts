import { useState, useEffect, useRef } from 'react';
import env from '../env';
import { registerSubscription } from '../services/pushApi';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushSubscription() {
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [supported, setSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSupported('PushManager' in window && 'serviceWorker' in navigator);
  }, []);

  async function subscribe(): Promise<PushSubscription | null> {
    if (!supported) return null;
    try {
      const registration = await navigator.serviceWorker.ready;
      const existing = await registration.pushManager.getSubscription();
      if (existing) {
        setSubscription(existing);
        return existing;
      }
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(env.VAPID_PUBLIC_KEY).buffer as ArrayBuffer,
      });
      await registerSubscription(sub);
      setSubscription(sub);
      return sub;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Push subscription failed';
      setError(msg);
      return null;
    }
  }

  return { subscription, supported, error, subscribe };
}
