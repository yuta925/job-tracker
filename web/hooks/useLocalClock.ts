"use client";

import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  const timer = window.setInterval(onChange, 60_000);
  window.addEventListener("focus", onChange);
  return () => {
    window.clearInterval(timer);
    window.removeEventListener("focus", onChange);
  };
}

const snapshot = () => Math.floor(Date.now() / 60_000);
const serverSnapshot = () => null;

// 初期HTMLは時刻未確定とし、利用者のブラウザの時計を購読する。
export function useLocalClock(): Date | null {
  const minute = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  return minute === null ? null : new Date(minute * 60_000);
}
