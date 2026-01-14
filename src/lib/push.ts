import webpush, { PushSubscription } from "web-push";

// VAPID 키 설정
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || "mailto:example@example.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export async function sendPushNotification(
  subscription: PushSubscriptionData,
  title: string,
  body: string
) {
  const payload = JSON.stringify({
    title,
    body,
  });

  try {
    await webpush.sendNotification(subscription as PushSubscription, payload);
    return { success: true };
  } catch (error) {
    console.error("Push notification error:", error);
    return { success: false, error };
  }
}

// 브라우저에서 사용할 구독 함수
export async function subscribeToPush(): Promise<PushSubscriptionData | null> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.error("Push notifications not supported");
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    });

    const subscriptionJson = subscription.toJSON();
    return {
      endpoint: subscriptionJson.endpoint!,
      keys: {
        p256dh: subscriptionJson.keys!.p256dh,
        auth: subscriptionJson.keys!.auth,
      },
    };
  } catch (error) {
    console.error("Push subscription error:", error);
    return null;
  }
}
