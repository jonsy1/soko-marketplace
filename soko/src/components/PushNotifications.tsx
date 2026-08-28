'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushNotifications() {
  const { data: session } = useSession();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!session?.user) return;
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!publicKey) return;

    if (Notification.permission === 'default') {
      const dismissed = localStorage.getItem('soko_push_dismissed');
      if (!dismissed) setShow(true);
    } else if (Notification.permission === 'granted') {
      subscribe();
    }
  }, [session]);

  async function subscribe() {
    try {
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) return;
      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
      }
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub }),
      });
    } catch {
      // Notifications are a nice-to-have — fail silently.
    }
  }

  async function enable() {
    setShow(false);
    const permission = await Notification.requestPermission();
    if (permission === 'granted') subscribe();
  }

  function dismiss() {
    setShow(false);
    localStorage.setItem('soko_push_dismissed', '1');
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80 z-50 bg-night text-white rounded-card shadow-lg p-4">
      <p className="font-semibold text-sm">🔔 Turn on notifications</p>
      <p className="text-xs text-white/70 mt-1">
        Get notified instantly when you receive an order or your order is confirmed.
      </p>
      <div className="flex gap-2 mt-3">
        <button onClick={enable} className="btn btn-primary text-xs flex-1 justify-center">
          Enable
        </button>
        <button onClick={dismiss} className="btn border border-white/20 text-xs flex-1 justify-center">
          Not now
        </button>
      </div>
    </div>
  );
}