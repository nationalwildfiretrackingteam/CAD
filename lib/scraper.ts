import axios from "axios";
import * as cheerio from "cheerio";
import { createHash } from "crypto";
import { Incident } from "./types";
import { geocodeAddress } from "./geocode";
import { categorizeIncident } from "./categorize";

const SOURCE_URL = "https://www.miamidade.gov/firecad/calls_include.asp";

// Stable ID from type + time + address to deduplicate across polls
function makeId(type: string, time: string, address: string): string {
  return createHash("md5")
    .update(`${type}|${time}|${address}`)
    .digest("hex")
    .slice(0, 12);
}

function isResidentialAddress(address: string): boolean {
  const nonResidential = [
    "hwy", "highway", "blvd", "boulevard", "pkwy", "parkway",
    "airport", "mall", "plaza", "park", "bridge", "overpass",
    "turnpike", "expressway", "i-95", "i-75", "i-836", "sr-",
  ];
  const lower = address.toLowerCase();
  return !nonResidential.some((k) => lower.includes(k));
}

export async function scrapeIncidents(): Promise<Incident[]> {
  let html: string;
  try {
    const res = await axios.get(SOURCE_URL, {
      timeout: 15000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; NWTT-CAD-Monitor/1.0; +https://nationalwildfiretrackingteam.org)",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    html = res.data;
  } catch (err) {
    console.error("Failed to fetch CAD source:", err);
    return [];
  }

  const $ = cheerio.load(html);
  const rawRows: Array<{
    type: string;
    time: string;
    address: string;
    units: string[];
  }> = [];

  // Miami-Dade fire CAD uses a table structure — parse all rows
  $("table tr").each((_, row) => {
    const cells = $(row).find("td");
    if (cells.length < 3) return;

    const texts = cells
      .map((_, cell) => $(cell).text().trim())
      .get()
      .filter(Boolean);

    if (texts.length < 3) return;

    // Skip header rows
    if (
      texts[0].toLowerCase().includes("type") ||
      texts[0].toLowerCase().includes("incident")
    )
      return;

    // Heuristic: first cell = type, second = time (HH:MM format), third+ = address/units
    const timePattern = /\d{1,2}:\d{2}/;
    let type = "";
    let time = "";
    let address = "";
    let units: string[] = [];

    if (texts.length >= 3) {
      type = texts[0];
      // Find which column has a time value
      const timeIdx = texts.findIndex((t) => timePattern.test(t));
      if (timeIdx > 0) {
        time = texts[timeIdx];
        address = texts.slice(1, timeIdx).join(" ").trim() || texts[1];
        units = texts.slice(timeIdx + 1).filter((t) => t.length > 0);
      } else {
        time = texts[1];
        address = texts[2];
        units = texts.slice(3);
      }
    }

    if (!type || !address) return;

    rawRows.push({ type, time, address, units });
  });

  // Geocode all addresses concurrently (bounded to avoid rate limits)
  const CONCURRENCY = 5;
  const incidents: Incident[] = [];

  for (let i = 0; i < rawRows.length; i += CONCURRENCY) {
    const batch = rawRows.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      batch.map(async ({ type, time, address, units }) => {
        const coords = await geocodeAddress(
          address,
          isResidentialAddress(address)
        );
        if (!coords) return null;

        const incident: Incident = {
          id: makeId(type, time, address),
          incidentType: type,
          category: categorizeIncident(type),
          time,
          address,
          units,
          latitude: coords.latitude,
          longitude: coords.longitude,
        };
        return incident;
      })
    );

    results.forEach((r) => {
      if (r) incidents.push(r);
    });
  }

  return incidents;
}
