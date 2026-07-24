// Batched analytics client (Part B.3). Buffers events in memory and flushes
// them together - via a 10s interval, at 20 buffered events (whichever
// first), or on tab-hide/unload via sendBeacon - never one request per
// interaction. rrweb is lazy-loaded so the storefront bundle never pays for
// it unless a session is actually being recorded.
import { API_BASE_URL } from '../config/api';

const EVENTS_URL = `${API_BASE_URL}/api/analytics/events`;
const REPLAY_URL = `${API_BASE_URL}/api/analytics/replay`;
const FLUSH_INTERVAL_MS = 10000;
const FLUSH_AT_COUNT = 20;

let eventBuffer = [];
let replayBuffer = [];
let flushTimer = null;
let started = false;

const sendBatch = (url, payloadKey, items) => {
  if (items.length === 0) return;
  const body = JSON.stringify({ [payloadKey]: items });

  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: 'application/json' });
    const ok = navigator.sendBeacon(url, blob);
    if (ok) return;
  }

  // Fallback for browsers without sendBeacon, or if the beacon's body was
  // too large - fire-and-forget, keepalive lets it survive page unload.
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    keepalive: true,
    body,
  }).catch(() => {
    // best-effort - analytics must never surface an error to the user
  });
};

const flushEvents = () => {
  if (eventBuffer.length === 0) return;
  const batch = eventBuffer;
  eventBuffer = [];
  sendBatch(EVENTS_URL, 'events', batch);
};

const flushReplay = () => {
  if (replayBuffer.length === 0) return;
  const batch = replayBuffer;
  replayBuffer = [];
  sendBatch(REPLAY_URL, 'events', batch);
};

const queueEvent = (event) => {
  eventBuffer.push({ ...event, timestamp: Date.now() });
  if (eventBuffer.length >= FLUSH_AT_COUNT) flushEvents();
};

export const trackPageView = (page) => {
  queueEvent({ type: 'pageview', page });
};

export const trackClick = (page, metadata = {}) => {
  queueEvent({ type: 'click', page, metadata });
};

export const trackFormSubmit = (page, formName) => {
  queueEvent({ type: 'form', page, metadata: { formName } });
};

export const trackSearch = (page, term) => {
  queueEvent({ type: 'search', page, metadata: { term } });
};

// Starts the buffered flush loop, page-unload handling, and rrweb session
// replay recording. Safe to call multiple times - only initializes once.
export const initAnalytics = () => {
  if (started) return;
  started = true;

  flushTimer = setInterval(() => {
    flushEvents();
    flushReplay();
  }, FLUSH_INTERVAL_MS);

  const flushAll = () => {
    flushEvents();
    flushReplay();
  };
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushAll();
  });
  window.addEventListener('beforeunload', flushAll);

  import('rrweb').then(({ record }) => {
    record({
      emit(event) {
        replayBuffer.push(event);
        if (replayBuffer.length >= FLUSH_AT_COUNT) flushReplay();
      },
    });
  }).catch(() => {
    // rrweb failing to load should never break the storefront
  });
};

export const stopAnalytics = () => {
  if (flushTimer) clearInterval(flushTimer);
  flushTimer = null;
  started = false;
};
