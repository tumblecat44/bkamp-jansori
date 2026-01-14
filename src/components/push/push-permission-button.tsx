"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export function PushPermissionButton() {
  const [permission, setPermission] = useState<NotificationPermission | "loading">("loading");
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    } else {
      setPermission("denied");
    }
  }, []);

  const handleSubscribe = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      alert("이 브라우저에서는 푸시 알림이 지원되지 않습니다.");
      return;
    }

    setIsSubscribing(true);

    try {
      // 알림 권한 요청
      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission !== "granted") {
        alert("알림 권한이 거부되었습니다. 브라우저 설정에서 변경할 수 있습니다.");
        return;
      }

      // Service Worker 등록
      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      // 푸시 구독
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      const subscriptionJson = subscription.toJSON();

      // 서버에 구독 정보 저장
      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: subscriptionJson.endpoint,
          p256dh: subscriptionJson.keys?.p256dh,
          auth: subscriptionJson.keys?.auth,
        }),
      });

      if (response.ok) {
        alert("알림이 활성화되었습니다! 🎉");
      } else {
        throw new Error("Failed to save subscription");
      }
    } catch (error) {
      console.error("Push subscription error:", error);
      alert("알림 설정 중 오류가 발생했습니다.");
    } finally {
      setIsSubscribing(false);
    }
  };

  if (permission === "loading") {
    return null;
  }

  if (permission === "granted") {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600">
        <span>✓</span>
        <span>알림 활성화됨</span>
      </div>
    );
  }

  return (
    <Button
      onClick={handleSubscribe}
      disabled={isSubscribing || permission === "denied"}
      variant={permission === "denied" ? "outline" : "default"}
    >
      {isSubscribing
        ? "설정 중..."
        : permission === "denied"
        ? "알림이 차단됨 (브라우저 설정에서 변경)"
        : "🔔 알림 받기"}
    </Button>
  );
}
