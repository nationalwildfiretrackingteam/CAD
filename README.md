# NWTT Live CAD Map

Real-time CAD incident map for Miami-Dade Fire Rescue — built for the National Wildfire Tracking Team.

Scrapes [Miami-Dade Fire CAD](https://www.miamidade.gov/firecad/calls_include.asp) every 60 seconds, geocodes addresses, and displays color-coded markers on a live Mapbox map.

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Mapbox GL JS** — interactive map
- **Axios + Cheerio** — scraping

## Setup

### 1. Clone and install

```bash
git clone <repo>
cd CAD
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Public token for map rendering (browser) |
| `MAPBOX_SECRET_TOKEN` | Secret token for geocoding API (server-side) |

Both tokens are available at [account.mapbox.com](https://account.mapbox.com/).  
The secret token must have the **Geocoding** scope enabled.

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API

### `GET /api/incidents`

Returns active CAD incidents.

```json
{
  "incidents": [
    {
      "id": "abc123def456",
      "incidentType": "Structure Fire",
      "category": "fire",
      "time": "14:32",
      "address": "123 Main St",
      "units": ["E21", "L12", "R4"],
      "latitude": 25.7617,
      "longitude": -80.1918
    }
  ],
  "lastUpdated": 1716825600000,
  "count": 12
}
```

**Categories:** `fire` | `ems` | `rescue` | `hazmat` | `other`

## Map Marker Colors

| Category | Color |
|---|---|
| Fire | Red |
| EMS | Blue |
| Rescue | Orange |
| Hazmat | Yellow |
| Other | Gray |

## Privacy

Residential addresses are offset by a small random amount (~100m) to prevent exact location identification. Non-residential addresses (highways, commercial zones) are not offset.

## Deployment

Deploy to [Vercel](https://vercel.com) and set the two environment variables in project settings. The scraper runs server-side on each API call; no external database is required.

```bash
npm run build
npm start
```
