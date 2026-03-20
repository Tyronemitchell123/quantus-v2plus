import { useState, useEffect } from "react";

export type Platform = "web" | "android" | "ios";

interface PlatformInfo {
  platform: Platform;
  isMobile: boolean;
  isTWA: boolean;
  isStandalone: boolean;
  /** True when billing must go through Google/Apple in-app purchase */
  requiresStoreBilling: boolean;
}

export function usePlatform(): PlatformInfo {
  const [info, setInfo] = useState<PlatformInfo>(() => detect());

  useEffect(() => {
    setInfo(detect());
  }, []);

  return info;
}

function detect(): PlatformInfo {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const isAndroid = /android/i.test(ua);
  const isIOS = /iphone|ipad|ipod/i.test(ua);

  // TWA detection: Trusted Web Activity sets document.referrer to android-app://
  const isTWA =
    typeof document !== "undefined" &&
    document.referrer.startsWith("android-app://");

  // Standalone = installed PWA or TWA
  const isStandalone =
    typeof window !== "undefined" &&
    (window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true ||
      isTWA);

  const platform: Platform = isAndroid ? "android" : isIOS ? "ios" : "web";
  const isMobile = isAndroid || isIOS;

  // Store billing required when running inside a native wrapper (TWA/standalone) on mobile
  const requiresStoreBilling = isMobile && isStandalone;

  return { platform, isMobile, isTWA, isStandalone, requiresStoreBilling };
}
