"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

function getOrCreateUserId(): string {
  let stored = localStorage.getItem("crew-user-id");
  if (!stored) {
    stored = crypto.randomUUID();
    localStorage.setItem("crew-user-id", stored);
  }
  return stored;
}

export default function Home() {
  const router = useRouter();
  const userIdRef = useRef<string>("");
  const [pressing, setPressing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const loggingInRef = useRef(false);

  useEffect(() => {
    userIdRef.current = getOrCreateUserId();
  }, []);

  const showToast = (message: string) => {
    setToast(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = useCallback(async () => {
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userIdRef.current }),
      });
      const data = await res.json();
      if (data.success) {
        router.push("/dashboard");
      } else {
        loggingInRef.current = false;
        showToast(data.error);
      }
    } catch {
      loggingInRef.current = false;
      showToast("Connection failed. Try again.");
    }
  }, [router]);

  const sendPress = useCallback(async (isPressing: boolean) => {
    if (!userIdRef.current) return;
    try {
      const res = await fetch("/api/press", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userIdRef.current, pressing: isPressing }),
      });
      const data = await res.json();
      if (data.thresholdMet && isPressing && !loggingInRef.current) {
        loggingInRef.current = true;
        handleLogin();
      }
    } catch {
      // network error — silently ignore
    }
  }, [handleLogin]);

  const startPressing = useCallback(() => {
    if (pressing) return;
    setPressing(true);
    sendPress(true);
    intervalRef.current = setInterval(() => sendPress(true), 1000);
  }, [pressing, sendPress]);

  const stopPressing = useCallback(() => {
    if (!pressing) return;
    setPressing(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    sendPress(false);
  }, [pressing, sendPress]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-[#0d0d0d] px-4 font-mono text-white">
      {/* Checkered accent strip */}
      <div className="fixed top-0 left-0 right-0 h-2 bg-checkered" />

      <h1 className="text-3xl font-bold tracking-widest uppercase text-neutral-300">
        Pit Crew Login
      </h1>

      {/* Ready Button */}
      <button
        onMouseDown={startPressing}
        onMouseUp={stopPressing}
        onMouseLeave={stopPressing}
        onTouchStart={startPressing}
        onTouchEnd={stopPressing}
        className="ready-button relative w-64 h-20 rounded-lg border-2 border-neutral-600 bg-neutral-800 text-xl font-bold uppercase tracking-wider select-none overflow-hidden transition-colors active:border-emerald-500"
      >
        <div
          className={`ready-fill absolute inset-0 ${
            pressing ? "animate-fill" : ""
          }`}
          style={{
            background: pressing
              ? "linear-gradient(90deg, #059669, #10b981)"
              : "transparent",
          }}
        />
        <span className="relative z-10 drop-shadow-md">
          {pressing ? "Holding..." : "Hold Ready"}
        </span>
      </button>

      {/* Error toast */}
      {toast && (
        <div
          className={`fixed bottom-8 left-1/2 -translate-x-1/2 rounded-lg bg-red-900/90 px-6 py-3 text-sm text-red-200 shadow-lg transition-opacity duration-500 ${
            toastVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          {toast}
        </div>
      )}

      {/* Checkered accent strip bottom */}
      <div className="fixed bottom-0 left-0 right-0 h-2 bg-checkered" />
    </div>
  );
}
