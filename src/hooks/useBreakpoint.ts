"use client";

import { useSyncExternalStore } from "react";

export type Breakpoint = "mobile" | "tablet" | "desktop";

function compute(): Breakpoint {
  const width = window.innerWidth;
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

function subscribe(callback: () => void) {
  window.addEventListener("resize", callback);
  window.addEventListener("orientationchange", callback);
  return () => {
    window.removeEventListener("resize", callback);
    window.removeEventListener("orientationchange", callback);
  };
}

function getServerSnapshot(): Breakpoint {
  return "desktop";
}

export function useBreakpoint(): Breakpoint {
  return useSyncExternalStore(subscribe, compute, getServerSnapshot);
}
