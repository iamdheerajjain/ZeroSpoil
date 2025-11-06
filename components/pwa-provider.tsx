"use client";

import { useEffect } from "react";

// Type declaration for workbox
declare global {
  interface Window {
    workbox?: {
      addEventListener: (event: string, callback: () => void) => void;
      messageSkipWaiting: () => void;
      register: () => void;
    };
  }
}

export function PWAProvider() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      window.workbox !== undefined
    ) {
      const wb = window.workbox;

      // Add event listeners to handle service worker updates
      wb.addEventListener("controlling", () => {
        window.location.reload();
      });

      wb.addEventListener("waiting", () => {
        // Show update available notification
        const updateAvailable = confirm(
          "A new version of ZeroSpoil is available. Would you like to update now?"
        );

        if (updateAvailable) {
          wb.messageSkipWaiting();
        }
      });

      wb.register();
    } else if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Fallback registration without workbox
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("SW registered: ", registration);

          // Check for updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;

            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (
                  newWorker.state === "installed" &&
                  navigator.serviceWorker.controller
                ) {
                  // New content is available
                  const updateAvailable = confirm(
                    "A new version of ZeroSpoil is available. Would you like to update now?"
                  );

                  if (updateAvailable) {
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch((registrationError) => {
          console.log("SW registration failed: ", registrationError);
        });
    }
  }, []);

  return null;
}

// PWA install prompt hook
export function useInstallPrompt() {
  useEffect(() => {
    let deferredPrompt: any;

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      deferredPrompt = e;

      // Show custom install button or notification
      console.log("PWA install prompt available");
    };

    const handleAppInstalled = () => {
      console.log("PWA was installed");
      deferredPrompt = null;
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  return {
    showInstallPrompt: () => {
      // This would trigger the install prompt
      console.log("Show install prompt");
    },
  };
}
