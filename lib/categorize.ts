import { Incident } from "./types";

type Category = Incident["category"];

const FIRE_KEYWORDS = [
  "fire", "structure fire", "brush fire", "wildfire", "vehicle fire",
  "dumpster fire", "grass fire", "arson", "smoke", "burning",
];

const EMS_KEYWORDS = [
  "ems", "medical", "cardiac", "stroke", "fall", "unconscious",
  "difficulty breathing", "chest pain", "sick", "overdose", "trauma",
  "injury", "bleeding", "seizure", "diabetic", "allergic",
];

const RESCUE_KEYWORDS = [
  "rescue", "extrication", "water rescue", "cliff rescue", "trapped",
  "collapse", "swift water", "trench", "confined space",
];

const HAZMAT_KEYWORDS = [
  "hazmat", "hazardous", "gas leak", "spill", "chemical", "biohazard",
  "carbon monoxide", "co detector", "fuel leak",
];

export function categorizeIncident(incidentType: string): Category {
  const lower = incidentType.toLowerCase();

  if (FIRE_KEYWORDS.some((k) => lower.includes(k))) return "fire";
  if (EMS_KEYWORDS.some((k) => lower.includes(k))) return "ems";
  if (RESCUE_KEYWORDS.some((k) => lower.includes(k))) return "rescue";
  if (HAZMAT_KEYWORDS.some((k) => lower.includes(k))) return "hazmat";
  return "other";
}
