"use client";

import { Incident } from "@/lib/types";

const CATEGORY_COLORS: Record<Incident["category"], string> = {
  fire: "bg-red-500",
  ems: "bg-blue-500",
  rescue: "bg-orange-500",
  hazmat: "bg-yellow-500",
  other: "bg-gray-500",
};

const CATEGORY_LABELS: Record<Incident["category"], string> = {
  fire: "FIRE",
  ems: "EMS",
  rescue: "RESCUE",
  hazmat: "HAZMAT",
  other: "OTHER",
};

interface Props {
  incidents: Incident[];
  lastUpdated: number;
  loading: boolean;
}

export default function IncidentSidebar({
  incidents,
  lastUpdated,
  loading,
}: Props) {
  const lastUpdatedStr = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
    : "--:--:--";

  const counts = incidents.reduce(
    (acc, i) => {
      acc[i.category] = (acc[i.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <aside className="flex flex-col h-full bg-[#0d0d1a] border-r border-white/5 w-72 shrink-0">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-mono font-semibold tracking-widest text-white/90 uppercase">
            NWTT Live CAD
          </span>
        </div>
        <div className="text-xs font-mono text-white/30">
          Miami-Dade Fire Rescue
        </div>
      </div>

      {/* Stats bar */}
      <div className="px-4 py-2.5 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {loading ? (
            <div className="w-3 h-3 border border-white/20 border-t-white/60 rounded-full animate-spin" />
          ) : (
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
          )}
          <span className="text-xs font-mono text-white/40">
            {loading ? "Updating..." : `Updated ${lastUpdatedStr}`}
          </span>
        </div>
        <span className="text-xs font-mono text-white/60 bg-white/5 px-2 py-0.5 rounded">
          {incidents.length}
        </span>
      </div>

      {/* Category summary */}
      {incidents.length > 0 && (
        <div className="px-4 py-2.5 border-b border-white/5 flex flex-wrap gap-1.5">
          {(Object.entries(counts) as [Incident["category"], number][])
            .sort((a, b) => b[1] - a[1])
            .map(([cat, count]) => (
              <span
                key={cat}
                className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded text-white/90 ${CATEGORY_COLORS[cat]}`}
              >
                {CATEGORY_LABELS[cat]} {count}
              </span>
            ))}
        </div>
      )}

      {/* Incident list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {incidents.length === 0 && !loading && (
          <div className="px-4 py-8 text-center text-white/20 text-xs font-mono">
            No active incidents
          </div>
        )}
        {loading && incidents.length === 0 && (
          <div className="px-4 py-8 text-center text-white/20 text-xs font-mono">
            Loading incidents...
          </div>
        )}
        <ul className="divide-y divide-white/[0.04]">
          {incidents.map((incident) => (
            <li
              key={incident.id}
              className="px-4 py-3 hover:bg-white/[0.03] transition-colors cursor-default"
            >
              <div className="flex items-start gap-2.5">
                <div
                  className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${CATEGORY_COLORS[incident.category]}`}
                />
                <div className="min-w-0">
                  <div className="text-xs font-mono font-semibold text-white/90 truncate uppercase tracking-wide">
                    {incident.incidentType}
                  </div>
                  <div className="text-[11px] font-mono text-white/40 truncate mt-0.5">
                    {incident.address}
                  </div>
                  <div className="text-[10px] font-mono text-white/25 mt-0.5">
                    {incident.time}
                    {incident.units.length > 0 && (
                      <span className="ml-2 text-white/20">
                        {incident.units.slice(0, 2).join(", ")}
                        {incident.units.length > 2 &&
                          ` +${incident.units.length - 2}`}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Legend */}
      <div className="px-4 py-3 border-t border-white/5">
        <div className="text-[10px] font-mono text-white/20 mb-2 uppercase tracking-widest">
          Legend
        </div>
        <div className="grid grid-cols-2 gap-1">
          {(
            Object.entries(CATEGORY_COLORS) as [
              Incident["category"],
              string,
            ][]
          ).map(([cat, color]) => (
            <div key={cat} className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full shrink-0 ${color}`} />
              <span className="text-[10px] font-mono text-white/30 capitalize">
                {cat}
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
