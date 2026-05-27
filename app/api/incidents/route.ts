import { NextResponse } from "next/server";
import { getIncidents } from "@/lib/incidentStore";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const { incidents, lastUpdated } = await getIncidents();
    return NextResponse.json(
      { incidents, lastUpdated, count: incidents.length },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
          "X-Last-Updated": new Date(lastUpdated).toISOString(),
        },
      }
    );
  } catch (err) {
    console.error("Incidents API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch incidents" },
      { status: 500 }
    );
  }
}
