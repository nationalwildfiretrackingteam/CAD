export interface Incident {
  id: string;
  incidentType: string;
  category: "fire" | "ems" | "rescue" | "hazmat" | "other";
  time: string;
  address: string;
  units: string[];
  latitude: number;
  longitude: number;
}

export interface GeocodeCacheEntry {
  latitude: number;
  longitude: number;
  timestamp: number;
}

export type MarkerColor = "red" | "blue" | "orange" | "yellow" | "gray";
