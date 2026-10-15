/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { build, files, version } from '$service-worker';
import { TRAFFIC_SAFETY_PICTOGRAM_REVISION } from '$lib/data/pictogram-cache.js';

const sw = self as unknown as ServiceWorkerGlobalScope;
const CACHE = `cache-${version}`;

const versionedPictogramAssets = files
	.filter((file) => /\/pictograms\/traffic-safety\/\d+\.png$/.test(file))
	.map((file) => `${file}?v=${TRAFFIC_SAFETY_PICTOGRAM_REVISION}`);

const ASSETS = [
  ...build,
	...files,
	...versionedPictogramAssets
];

sw.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => {
      sw.skipWaiting();
    })
  );
});

sw.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(async (keys) => {
      for (const key of keys) {
        if (key !== CACHE) await caches.delete(key);
      }
      sw.clients.claim();
    })
  );
});

sw.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Navigation requests: let GitHub Pages 404.html SPA fallback work normally.
  // Only intercept if truly offline.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        let cache: Cache | undefined;
        try {
          cache = await caches.open(CACHE);
        } catch {}

        // Keep query strings (which may contain a child's name or avatar) out
        // of the cache key. The route shell is identical without them, and
        // SvelteKit can still read the current URL after the cached page loads.
        const cacheUrl = new URL(event.request.url);
        cacheUrl.search = '';
        cacheUrl.hash = '';
        const cacheKey = new Request(cacheUrl.toString(), { method: 'GET' });

        try {
          // Try network — GitHub Pages returns 404 with SPA HTML, which is fine
          const response = await fetch(event.request);
          // Cache successful HTML documents so previously visited routes remain
          // available offline. Do not cache error pages or query-string data.
          if (
            cache &&
            response.status === 200 &&
            response.headers.get('content-type')?.includes('text/html') &&
            new URL(response.url || event.request.url).origin === location.origin
          ) {
            try {
              await cache.put(cacheKey, response.clone());
            } catch {}
          }
          // Accept any response below 500 (including the GitHub Pages SPA fallback).
          if (response.status < 500) {
            return addCoopCoep(response);
          }
        } catch {}

        // Truly offline: serve this route if it was visited before, then fall
        // back to the launcher shell for routes without a cached document.
        let cached: Response | undefined;
        if (cache) {
          try {
            cached =
              (await cache.match(cacheKey)) ||
              (await cache.match('/launcher/index.html')) ||
              (await cache.match('/launcher/')) ||
              (await cache.match('/index.html')) ||
              (await cache.match('/'));
          } catch {}
        }
        if (cached) return addCoopCoep(cached);

        return new Response('<html><body><h1>Offline</h1><p>Anslut till internet och försök igen.</p></body></html>', {
          status: 503,
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
      })()
    );
    return;
  }

  // Cache Piper TTS model files from HuggingFace (cache-first after first download)
  if (url.hostname.includes('huggingface.co') && (url.pathname.endsWith('.onnx') || url.pathname.endsWith('.onnx.json') || url.pathname.endsWith('.wasm') || url.pathname.endsWith('.data'))) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE).then((cache) => cache.put(event.request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Skip external requests except ARASAAC images
  if (url.origin !== location.origin && !url.hostname.includes('arasaac.org')) return;

  const isAsset = ASSETS.includes(url.pathname);

  if (isAsset) {
    // Cache-first for static build assets
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request).then((response) => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE).then((cache) => cache.put(event.request, clone));
          }
          return response;
        }).catch(() => new Response('Offline', { status: 503 }));
      })
    );
  } else {
    // Network-first for dynamic content (ARASAAC images etc)
    event.respondWith(
      fetch(event.request).then((response) => {
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        return caches.match(event.request).then((cached) => {
          return cached || new Response('Offline', { status: 503 });
        });
      })
    );
  }
});

function addCoopCoep(response: Response): Response {
  // Don't add COOP/COEP — it breaks cross-origin images (ARASAAC pictograms)
  return response;
}
