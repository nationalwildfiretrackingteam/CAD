import axios from "axios";
import { getCached, setCache } from "./geocodeCache";

// Slight random offset to avoid pinpointing exact residential addresses
function privacyOffset(): number {
  return (Math.random() - 0.5) * 0.002; // ~100m radius
}

export async function geocodeAddress(
  address: string,
  isResidential = true
): Promise<{ latitude: number; longitude: number } | null> {
  const cached = getCached(address);
  if (cached) {
    return {
      latitude: cached.latitude + (isResidential ? privacyOffset() : 0),
      longitude: cached.longitude + (isResidential ? privacyOffset() : 0),
    };
  }

  const token = process.env.MAPBOX_SECRET_TOKEN;
  if (!token) {
    console.error("MAPBOX_SECRET_TOKEN not set");
    return null;
  }

  const query = encodeURIComponent(`${address}, Miami-Dade County, FL`);
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${token}&limit=1&country=US`;

  try {
    const res = await axios.get(url, { timeout: 5000 });
    const features = res.data?.features;
    if (!features || features.length === 0) return null;

    const [lng, lat] = features[0].center;
    setCache(address, lat, lng);

    return {
      latitude: lat + (isResidential ? privacyOffset() : 0),
      longitude: lng + (isResidential ? privacyOffset() : 0),
    };
  } catch (err) {
    console.error(`Geocoding failed for "${address}":`, err);
    return null;
  }
}
