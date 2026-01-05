"use client";

type GeoResult = { lat: number; lng: number; permission: "granted" | "denied"; error?: string };

export function requestBrowserGeo(timeoutMs = 8000): Promise<GeoResult> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      reject(new Error("دستگاه موقعیت‌یاب را پشتیبانی نمی‌کند."));
      return;
    }

    let settled = false;
    const timer = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(new Error("درخواست موقعیت زمان‌بر شد. دوباره تلاش کن."));
    }, timeoutMs);

    const done = (cb: () => void) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      cb();
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        done(() => {
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            permission: "granted",
          });
        });
      },
      (err) => {
        done(() => {
          if (err.code === err.PERMISSION_DENIED) {
            resolve({
              lat: 0,
              lng: 0,
              permission: "denied",
              error: "اجازه دسترسی به موقعیت داده نشد.",
            });
            return;
          }
          reject(new Error("دریافت موقعیت با مشکل مواجه شد. لطفا دوباره تلاش کن."));
        });
      },
      { enableHighAccuracy: false, timeout: timeoutMs, maximumAge: 0 },
    );
  });
}
