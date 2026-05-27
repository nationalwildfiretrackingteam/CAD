import CADApp from "@/components/CADApp";

// Force dynamic rendering so NEXT_PUBLIC_ env vars are read at request time
// instead of being baked in at build time (which would embed empty values)
export const dynamic = "force-dynamic";

export default function Home() {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

  if (!mapboxToken) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0d0d1a] text-white/40 text-sm font-mono">
        NEXT_PUBLIC_MAPBOX_TOKEN is not set. Check your .env.local file.
      </div>
    );
  }

  return <CADApp mapboxToken={mapboxToken} />;
}
