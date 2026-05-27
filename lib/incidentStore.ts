import { Incident } from "./types";
import { scrapeIncidents } from "./scraper";

const POLL_INTERVAL_MS = 60 * 1000;

interface Store {
  incidents: Incident[];
  lastUpdated: number;
  polling: boolean;
}

// Singleton store shared across API requests in the same process
const store: Store = {
  incidents: [],
  lastUpdated: 0,
  polling: false,
};

export async function getIncidents(): Promise<{
  incidents: Incident[];
  lastUpdated: number;
}> {
  // Trigger a refresh if data is stale or empty
  if (Date.now() - store.lastUpdated > POLL_INTERVAL_MS) {
    await refreshIncidents();
  }
  return { incidents: store.incidents, lastUpdated: store.lastUpdated };
}

async function refreshIncidents(): Promise<void> {
  if (store.polling) return; // prevent concurrent fetches
  store.polling = true;
  try {
    const fresh = await scrapeIncidents();
    if (fresh.length > 0) {
      store.incidents = deduplicateById(fresh);
      store.lastUpdated = Date.now();
    }
  } finally {
    store.polling = false;
  }
}

function deduplicateById(incidents: Incident[]): Incident[] {
  const seen = new Set<string>();
  return incidents.filter((i) => {
    if (seen.has(i.id)) return false;
    seen.add(i.id);
    return true;
  });
}
