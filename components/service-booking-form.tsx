"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import type { ServicePackage } from "@/lib/data";
import { BOOKING_API, fetchJson } from "@/lib/api-client";

type BookingService = {
  id?: string;
  slug: string;
  title: string;
  packages: ServicePackage[];
};

function prependStorage<T extends { id: string }>(key: string, item: T) {
  if (typeof window === "undefined") return;
  try {
    const items = JSON.parse(window.localStorage.getItem(key) || "[]") as T[];
    window.localStorage.setItem(key, JSON.stringify([item, ...items.filter((entry) => entry.id !== item.id)].slice(0, 200)));
  } catch {
    window.localStorage.setItem(key, JSON.stringify([item]));
  }
}

type FormState = {
  name: string;
  mobile: string;
  email: string;
  eventDate: string;
  eventType: string;
  location: string;
  guestCount: string;
  budget: string;
  additionalRequirements: string;
  packageSelection: string;
  paymentMethod: string;
};

const initialState: FormState = {
  name: "",
  mobile: "",
  email: "",
  eventDate: "",
  eventType: "Wedding",
  location: "",
  guestCount: "",
  budget: "",
  additionalRequirements: "",
  packageSelection: "Signature",
  paymentMethod: "Razorpay"
};

export function ServiceBookingForm({ service }: { service: BookingService }) {
  const searchParams = useSearchParams();
  const selectedPackage = searchParams.get("package");
  const [form, setForm] = useState<FormState>(() => ({
    ...initialState,
    packageSelection: selectedPackage || "Signature"
  }));
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  const packageOptions = useMemo(() => {
    const names = service.packages.map((pkg) => pkg.name).filter(Boolean);
    return Array.from(new Set([...(names.length ? names : []), "Custom"]));
  }, [service.packages]);

  function updateField(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setError("");

    try {
      const result = (await fetchJson(BOOKING_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_booking",
          ...form,
          phone: form.mobile,
          serviceId: service.id,
          serviceSlug: service.slug,
          serviceName: service.title,
          bookingDate: form.eventDate,
          guestCount: Number(form.guestCount || 0),
          budget: Number(form.budget || 0),
          specialRequirements: form.additionalRequirements,
          gardenName: `${service.title} Service Booking`,
          gardenAddress: form.location,
          placeId: `service-${service.slug}`,
          paymentMethod: "Razorpay"
        })
      })) as { bookingId: string; paymentUrl?: string };
      const now = new Date().toISOString();
      prependStorage("rv_leads", {
        id: `LED-${Date.now()}`,
        name: form.name,
        mobile: form.mobile,
        email: form.email,
        eventDate: form.eventDate,
        eventType: form.eventType,
        guestCount: Number(form.guestCount || 0),
        budget: Number(form.budget || 0),
        selectedGarden: `${service.title} Service Booking`,
        message: form.additionalRequirements,
        source: `${service.title} booking form`,
        status: "New Leads",
        staff: "Unassigned",
        createdAt: now
      });
      prependStorage("rv_bookings", {
        id: result.bookingId || `BKG-${Date.now()}`,
        name: form.name,
        mobile: form.mobile,
        email: form.email,
        date: form.eventDate,
        eventType: form.eventType,
        venue: `${service.title} Service Booking`,
        amount: form.budget,
        paymentMethod: "Razorpay",
        guestCount: Number(form.guestCount || 0),
        status: "Pending",
        paymentStatus: "Pending",
        message: form.additionalRequirements,
        createdAt: now
      });
      setBookingId(result.bookingId);
      setPaymentUrl(result.paymentUrl || null);
      setStatus("success");
    } catch {
      setStatus("error");
      setError("We could not submit your booking right now. Please try again.");
    }
  }

  const inputClass =
    "focus-ring w-full rounded-[8px] border border-white/12 bg-white/8 px-4 py-3 text-sm text-ivory outline-none transition placeholder:text-cream/40 focus:border-gold";
  const labelClass = "text-xs font-bold uppercase tracking-[0.22em] text-gold";

  return (
    <form onSubmit={handleSubmit} className="glass rounded-[8px] p-5 sm:p-7">
      {status === "success" ? (
        <div className="mb-5 rounded-[8px] border border-gold/30 bg-gold/12 p-4 text-sm font-semibold text-cream">
          Booking submitted successfully. Please complete payment to confirm your booking.
        </div>
      ) : null}
      {status === "error" ? (
        <div className="mb-5 rounded-[8px] border border-red-300/30 bg-red-500/10 p-4 text-sm font-semibold text-cream">
          {error}
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <label className="grid gap-2">
          <span className={labelClass}>Name</span>
          <input className={inputClass} required value={form.name} onChange={(event) => updateField("name", event.target.value)} placeholder="Your full name" />
        </label>
        <label className="grid gap-2">
          <span className={labelClass}>Mobile Number</span>
          <input className={inputClass} required value={form.mobile} onChange={(event) => updateField("mobile", event.target.value)} placeholder="+91 98765 43210" />
        </label>
        <label className="grid gap-2">
          <span className={labelClass}>Email</span>
          <input className={inputClass} required type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} placeholder="you@example.com" />
        </label>
        <label className="grid gap-2">
          <span className={labelClass}>Event Date</span>
          <input className={inputClass} required type="date" value={form.eventDate} onChange={(event) => updateField("eventDate", event.target.value)} />
        </label>
        <label className="grid gap-2">
          <span className={labelClass}>Event Type</span>
          <select className={inputClass} value={form.eventType} onChange={(event) => updateField("eventType", event.target.value)}>
            {["Wedding", "Reception", "Engagement", "Haldi", "Mehendi", "Sangeet", "Corporate Event", "Birthday"].map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-2">
          <span className={labelClass}>Location</span>
          <input className={inputClass} required value={form.location} onChange={(event) => updateField("location", event.target.value)} placeholder="Venue or city" />
        </label>
        <label className="grid gap-2">
          <span className={labelClass}>Guest Count</span>
          <input className={inputClass} required min="1" type="number" value={form.guestCount} onChange={(event) => updateField("guestCount", event.target.value)} placeholder="300" />
        </label>
        <label className="grid gap-2">
          <span className={labelClass}>Budget</span>
          <input className={inputClass} required min="0" type="number" value={form.budget} onChange={(event) => updateField("budget", event.target.value)} placeholder="150000" />
        </label>
        <label className="grid gap-2">
          <span className={labelClass}>Package Selection</span>
          <select className={inputClass} value={form.packageSelection} onChange={(event) => updateField("packageSelection", event.target.value)}>
            {packageOptions.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 md:col-span-2">
          <span className={labelClass}>Additional Requirements</span>
          <textarea
            className={`${inputClass} min-h-32 resize-y`}
            value={form.additionalRequirements}
            onChange={(event) => updateField("additionalRequirements", event.target.value)}
            placeholder="Share theme, timings, rituals, artist preferences or any special requests."
          />
        </label>
      </div>
      {status !== "success" ? (
        <button
          type="submit"
          disabled={status === "submitting"}
          className="focus-ring mt-7 inline-flex w-full items-center justify-center rounded-full bg-gold px-6 py-4 text-sm font-bold text-ink shadow-glow transition hover:-translate-y-0.5 hover:bg-cream disabled:cursor-not-allowed disabled:opacity-70"
        >
          {status === "submitting" ? "Submitting..." : "Submit Booking"}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => {
            const razorpayBase =
              process.env.NEXT_PUBLIC_RAZORPAY_CHECKOUT_URL ||
              "https://rzp.io/l/your-razorpay-checkout";
            const checkoutUrl =
              paymentUrl ||
              `${razorpayBase}?bookingId=${encodeURIComponent(bookingId || "")}&service=${encodeURIComponent(service.slug)}`;
            if (typeof window !== "undefined") {
              window.location.assign(checkoutUrl);
            }
          }}
          className="focus-ring mt-7 inline-flex w-full items-center justify-center rounded-full bg-gold px-6 py-4 text-sm font-bold text-ink shadow-glow transition hover:-translate-y-0.5 hover:bg-cream"
        >
          Pay with Razorpay
        </button>
      )}
    </form>
  );
}
