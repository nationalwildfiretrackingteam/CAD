"use client";

import { useEffect, useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Incident } from "@/lib/types";

const CATEGORY_COLORS: Record<Incident["category"], string> = {
  fire: "#ef4444",
  ems: "#3b82f6",
  rescue: "#f97316",
  hazmat: "#eab308",
  other: "#6b7280",
};

interface Props {
  incidents: Incident[];
  mapboxToken: string;
}

export default function IncidentMap({ incidents, mapboxToken }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapboxgl.accessToken = mapboxToken;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [-80.2, 25.77], // Miami-Dade
      zoom: 10,
      attributionControl: false,
    });

    map.addControl(new mapboxgl.NavigationControl(), "bottom-right");
    map.addControl(
      new mapboxgl.AttributionControl({ compact: true }),
      "bottom-left"
    );

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [mapboxToken]);

  const updateMarkers = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    incidents.forEach((incident) => {
      const color = CATEGORY_COLORS[incident.category];

      // Custom pulsing dot element
      const el = document.createElement("div");
      el.className = "incident-marker";
      el.style.cssText = `
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: ${color};
        border: 2px solid rgba(255,255,255,0.8);
        box-shadow: 0 0 0 0 ${color};
        animation: pulse-marker 2s infinite;
        cursor: pointer;
      `;

      const unitsHtml =
        incident.units.length > 0
          ? `<div class="mt-1.5 pt-1.5 border-t border-white/20">
               <span class="text-white/50 text-xs">Units</span>
               <div class="text-white/80 text-xs mt-0.5">${incident.units.join(", ")}</div>
             </div>`
          : "";

      const popup = new mapboxgl.Popup({
        offset: 12,
        closeButton: true,
        className: "incident-popup",
        maxWidth: "280px",
      }).setHTML(`
        <div style="
          background: #1a1a2e;
          border: 1px solid ${color}40;
          border-radius: 8px;
          padding: 12px;
          font-family: ui-monospace, monospace;
          min-width: 220px;
        ">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
            <div style="
              width:10px;height:10px;border-radius:50%;
              background:${color};flex-shrink:0;
            "></div>
            <span style="color:${color};font-weight:600;font-size:13px;text-transform:uppercase;letter-spacing:0.05em;">
              ${escapeHtml(incident.incidentType)}
            </span>
          </div>
          <div style="color:#94a3b8;font-size:11px;margin-bottom:4px;">
            <span style="color:#64748b;">Time</span>&nbsp;
            <span style="color:#e2e8f0;">${escapeHtml(incident.time)}</span>
          </div>
          <div style="color:#94a3b8;font-size:11px;margin-bottom:4px;">
            <span style="color:#64748b;">Location</span>&nbsp;
            <span style="color:#e2e8f0;">${escapeHtml(incident.address)}</span>
          </div>
          ${
            incident.units.length > 0
              ? `<div style="color:#94a3b8;font-size:11px;margin-top:6px;padding-top:6px;border-top:1px solid #ffffff20;">
              <span style="color:#64748b;">Units</span>&nbsp;
              <span style="color:#e2e8f0;">${incident.units.map(escapeHtml).join(", ")}</span>
            </div>`
              : ""
          }
        </div>
      `);

      const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
        .setLngLat([incident.longitude, incident.latitude])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [incidents]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (map.isStyleLoaded()) {
      updateMarkers();
    } else {
      map.once("load", updateMarkers);
    }
  }, [incidents, updateMarkers]);

  return (
    <>
      <style>{`
        .incident-marker { position: relative; }
        @keyframes pulse-marker {
          0%   { box-shadow: 0 0 0 0 currentColor; }
          70%  { box-shadow: 0 0 0 8px transparent; }
          100% { box-shadow: 0 0 0 0 transparent; }
        }
        .mapboxgl-popup-content {
          background: transparent !important;
          padding: 0 !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5) !important;
          border-radius: 8px !important;
        }
        .mapboxgl-popup-close-button {
          color: #94a3b8 !important;
          font-size: 16px !important;
          right: 6px !important;
          top: 4px !important;
          background: transparent !important;
        }
        .mapboxgl-popup-tip { display: none !important; }
        .mapboxgl-ctrl-attrib { background: rgba(0,0,0,0.5) !important; }
        .mapboxgl-ctrl-attrib a { color: #64748b !important; }
      `}</style>
      <div ref={containerRef} className="w-full h-full" />
    </>
  );
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
