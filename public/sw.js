const CACHE_NAME = "zerospoil-v1.0.0";
const STATIC_CACHE_URLS = [
  "/",
  "/dashboard",
  "/dashboard/food-items",
  "/dashboard/recipes",
  "/dashboard/analytics",
  "/dashboard/donations",
  "/dashboard/profile",
  "/manifest.json",
  // Add critical CSS and JS files here when known
];

const DYNAMIC_CACHE_NAME = "zerospoil-dynamic-v1.0.0";

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("Service Worker installing...");

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Caching static assets");
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log("Static assets cached successfully");
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("Failed to cache static assets:", error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker activating...");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log("Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log("Service Worker activated");
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and chrome-extension requests
  if (request.method !== "GET" || url.protocol === "chrome-extension:") {
    return;
  }

  // API requests - network first, cache fallback
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Only cache successful responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached version if available
          return caches.match(request);
        })
    );
    return;
  }

  // Static assets and pages - cache first, network fallback
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request)
        .then((response) => {
          // Don't cache error responses
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response;
          }

          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });

          return response;
        })
        .catch(() => {
          // For navigation requests, return a custom offline page
          if (request.mode === "navigate") {
            return (
              caches.match("/offline.html") ||
              new Response(
                `
                <!DOCTYPE html>
                <html>
                <head>
                  <title>ZeroSpoil - Offline</title>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <style>
                    body { 
                      font-family: system-ui, -apple-system, sans-serif; 
                      text-align: center; 
                      padding: 2rem; 
                      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                      color: white;
                      min-height: 100vh;
                      margin: 0;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      flex-direction: column;
                    }
                    .container {
                      background: rgba(255, 255, 255, 0.1);
                      padding: 3rem;
                      border-radius: 1rem;
                      backdrop-filter: blur(10px);
                    }
                    h1 { margin-bottom: 1rem; }
                    p { margin-bottom: 2rem; opacity: 0.9; }
                    button {
                      background: rgba(255, 255, 255, 0.2);
                      border: 1px solid rgba(255, 255, 255, 0.3);
                      color: white;
                      padding: 0.75rem 1.5rem;
                      border-radius: 0.5rem;
                      cursor: pointer;
                      font-size: 1rem;
                    }
                    button:hover {
                      background: rgba(255, 255, 255, 0.3);
                    }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <h1>🌱 ZeroSpoil</h1>
                    <h2>You're Offline</h2>
                    <p>Some features require an internet connection. Please check your connection and try again.</p>
                    <button onclick="window.location.reload()">Try Again</button>
                  </div>
                </body>
                </html>
                `,
                {
                  headers: { "Content-Type": "text/html" },
                }
              )
            );
          }

          throw error;
        });
    })
  );
});

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    console.log("Background sync triggered");

    event.waitUntil(
      // Process any offline actions stored in IndexedDB
      processOfflineActions()
    );
  }
});

// Push notifications
self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: "/icons/icon-192x192.png",
    vibrate: [100, 50, 100],
    data: data.data,
    actions: data.actions || [],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus();
          }
        }

        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

async function processOfflineActions() {
  // This would process any actions that were queued while offline
  // Implementation depends on your offline storage strategy
  console.log("Processing offline actions...");
}
