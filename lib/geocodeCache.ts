import { GeocodeCacheEntry } from "./types";

// In-memory geocode cache — survives across requests within the same process
const cache = new Map<string, GeocodeCacheEntry>();
const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function getCached(address: string): GeocodeCacheEntry | null {
  const entry = cache.get(normalizeKey(address));
  if (!entry) return null;
  if (Date.now() - entry.timestamp > TTL_MS) {
    cache.delete(normalizeKey(address));
    return null;
  }
  return entry;
}

export function setCache(address: string, lat: number, lng: number): void {
  cache.set(normalizeKey(address), {
    latitude: lat,
    longitude: lng,
    timestamp: Date.now(),
  });
}

function normalizeKey(address: string): string {
  return address.toLowerCase().trim();
}
