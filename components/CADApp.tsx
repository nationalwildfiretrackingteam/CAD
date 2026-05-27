"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { Incident } from "@/lib/types";
import IncidentSidebar from "./IncidentSidebar";

// Mapbox GL must be loaded client-side only
const IncidentMap = dynamic(() => import("./IncidentMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#0d0d1a]">
      <div className="text-white/20 text-xs font-mono animate-pulse">
        Loading map...
      </div>
    </div>
  ),
});

const REFRESH_INTERVAL_MS = 60 * 1000;

interface Props {
  mapboxToken: string;
}

export default function CADApp({ mapboxToken }: Props) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [lastUpdated, setLastUpdated] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchIncidents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/incidents", { cache: "no-store" });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      setIncidents(data.incidents ?? []);
      setLastUpdated(data.lastUpdated ?? Date.now());
    } catch (err) {
      console.error("Failed to fetch incidents:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIncidents();
    intervalRef.current = setInterval(fetchIncidents, REFRESH_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchIncidents]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0d0d1a]">
      {/* Sidebar — hidden on mobile when toggled */}
      <div
        className={`
          transition-all duration-300 ease-in-out overflow-hidden
          ${sidebarOpen ? "w-72" : "w-0"}
          md:relative absolute z-20 h-full
        `}
      >
        {sidebarOpen && (
          <IncidentSidebar
            incidents={incidents}
            lastUpdated={lastUpdated}
            loading={loading}
          />
        )}
      </div>

      {/* Map area */}
      <div className="flex-1 relative h-full">
        <IncidentMap incidents={incidents} mapboxToken={mapboxToken} />

        {/* Toggle sidebar button */}
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className="
            absolute top-4 left-4 z-10
            bg-[#0d0d1a]/90 backdrop-blur-sm
            border border-white/10 rounded
            px-2.5 py-1.5
            text-white/50 hover:text-white/90
            text-xs font-mono transition-colors
            flex items-center gap-1.5
          "
          aria-label="Toggle sidebar"
        >
          <span className="text-[10px]">{sidebarOpen ? "◀" : "▶"}</span>
          <span className="hidden sm:inline">
            {sidebarOpen ? "Hide" : "Incidents"}
          </span>
        </button>

        {/* Refresh button */}
        <button
          onClick={fetchIncidents}
          disabled={loading}
          className="
            absolute top-4 right-4 z-10
            bg-[#0d0d1a]/90 backdrop-blur-sm
            border border-white/10 rounded
            px-2.5 py-1.5
            text-white/50 hover:text-white/90
            disabled:opacity-40
            text-xs font-mono transition-colors
            flex items-center gap-1.5
          "
          aria-label="Refresh incidents"
        >
          <span className={loading ? "animate-spin inline-block" : ""}>↻</span>
          <span className="hidden sm:inline">Refresh</span>
        </button>

        {/* Incident count badge (mobile) */}
        {!sidebarOpen && incidents.length > 0 && (
          <div className="absolute top-4 left-14 z-10 bg-red-500/90 text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded">
            {incidents.length}
          </div>
        )}
      </div>
    </div>
  );
}
