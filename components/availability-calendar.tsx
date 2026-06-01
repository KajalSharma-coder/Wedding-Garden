"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";

type Day = { date: string; status: "available" | "blocked" | "booked" | "unknown" };

export default function AvailabilityCalendar({ slug, blockedDates = [] }: { slug: string; blockedDates?: string[] }) {
  const [days, setDays] = useState<Day[]>([]);

  useEffect(() => {
    const start = new Date();
    const list: Day[] = Array.from({ length: 30 }).map((_, i) => {
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      return { date: d.toISOString().slice(0, 10), status: "unknown" };
    });
    setDays(list);
  }, [slug]);

  useEffect(() => {
    // mark blockedDates provided server-side immediately
    if (!blockedDates || !blockedDates.length) return;
    setDays((current) => current.map((d) => ({ ...d, status: blockedDates.includes(d.date) ? "blocked" : d.status })));
  }, [blockedDates]);

  useEffect(() => {
    let mounted = true;
    async function fetchAvailability() {
      try {
        const res = await fetch(`/api/venues/${encodeURIComponent(slug)}/availability`);
        if (!mounted) return;
        if (!res.ok) return;
        const json = await res.json();
        const map = new Map<string, string>();
        (json.availability || []).forEach((row: any) => map.set((row.available_date || "").slice(0, 10), (row.status || "available").toLowerCase()));
        setDays((current) => current.map((d) => ({ ...d, status: (map.get(d.date) as any) || d.status || "available" })));
      } catch (error) {
        // ignore
      }
    }
    fetchAvailability();
    return () => { mounted = false; };
  }, [slug]);

  const monthLabel = useMemo(() => {
    const d = new Date();
    return d.toLocaleString("default", { month: "long", year: "numeric" });
  }, []);

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <CalendarDays className="text-maroon" size={20} />
        <h3 className="font-display text-2xl">{monthLabel} (next 30 days)</h3>
      </div>
      <div className="grid grid-cols-7 gap-3">
        {days.map((d) => (
          <div key={d.date} className={`rounded-[6px] border p-3 text-center text-sm ${d.status === "blocked" ? "border-rose-300 bg-rose-500/8 text-rose-100" : d.status === "booked" ? "border-amber-300 bg-amber-300/8 text-amber-100" : "border-white/10 bg-white/[0.025] text-cream/80"}`}>
            <div className="font-bold">{new Date(d.date).getDate()}</div>
            <div className="mt-1 text-xs">{d.status === "blocked" ? "Blocked" : d.status === "booked" ? "Booked" : "Available"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
