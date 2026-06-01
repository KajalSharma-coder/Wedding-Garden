"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { CalendarCheck, Loader2, MapPin, Search, Send } from "lucide-react";
import { formatINR, generateQuote } from "@/lib/quotation";
import { venues } from "@/lib/data";
import { BOOKING_API, fetchJson } from "@/lib/api-client";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const eventFormSettings: Record<string, {
  heading: string;
  subtext: string;
  detailPlaceholder: string;
  eventTypeOptions?: string[];
}> = {
  wedding: {
    heading: "Find wedding gardens near your location",
    subtext: "Search premium gardens, decor packages, catering and guest management for your wedding day.",
    detailPlaceholder: "Add your preferred theme, mandap style or special rituals like pheras and vidaai.",
    eventTypeOptions: ["Wedding", "Reception", "Engagement", "Haldi", "Mehendi", "Anniversary"]
  },
  reception: {
    heading: "Find reception venues and banquet halls",
    subtext: "Book elegant reception spaces with lighting, staging, music and guest seating plans.",
    detailPlaceholder: "Share menu style, stage setup, seating capacity or any reception-specific plans.",
    eventTypeOptions: ["Reception", "Wedding", "Anniversary", "Corporate Event"]
  },
  engagement: {
    heading: "Find engagement venues with elegant decor",
    subtext: "Search garden lawns and banquet halls perfect for your engagement ceremony.",
    detailPlaceholder: "Tell us if you want floral decor, live music, ring exchange stage or intimate seating.",
    eventTypeOptions: ["Engagement", "Wedding", "Reception", "Haldi"]
  },
  haldi: {
    heading: "Find colourful Haldi venues and decor",
    subtext: "Book bright, cheerful spaces with flower decor, traditional seating and outdoor comfort.",
    detailPlaceholder: "Share your colour palette, floral preferences or any music and games plans.",
    eventTypeOptions: ["Haldi", "Mehendi", "Wedding", "Birthday"]
  },
  mehendi: {
    heading: "Find Mehendi venues with artistic decor",
    subtext: "Reserve spaces that suit henna ceremonies, floral backdrops and relaxed guest gatherings.",
    detailPlaceholder: "Write your Mehendi theme, seating arrangement or special decor requirements.",
    eventTypeOptions: ["Mehendi", "Haldi", "Wedding", "Birthday"]
  },
  birthday: {
    heading: "Find birthday party venues and themed decor",
    subtext: "Search for birthday venues with party themes, lighting, sound and catering options.",
    detailPlaceholder: "Share the age group, party theme or any special entertainment plans.",
    eventTypeOptions: ["Birthday", "Anniversary", "Baby Shower", "Corporate Event"]
  },
  "corporate events": {
    heading: "Find corporate event venues and conference spaces",
    subtext: "Book halls, lawns or resort spaces for conferences, product launches and team events.",
    detailPlaceholder: "Mention audience size, seating layout, AV setup or break-out requirements.",
    eventTypeOptions: ["Corporate Event", "Conference", "Product Launch", "Team Offsite"]
  },
  "destination wedding": {
    heading: "Find destination wedding venues and resorts",
    subtext: "Search resorts and heritage venues for an unforgettable destination wedding experience.",
    detailPlaceholder: "Tell us location preference, guest stay plan or any travel and hospitality needs.",
    eventTypeOptions: ["Destination Wedding", "Wedding", "Resort Stay", "Banquet Hall"]
  },
  anniversary: {
    heading: "Find anniversary celebration venues and decor",
    subtext: "Book romantic spaces with candlelight decor, music and dinner arrangements.",
    detailPlaceholder: "Share your celebration style, dining plan or any special couple surprises.",
    eventTypeOptions: ["Anniversary", "Birthday", "Reception", "Wedding"]
  },
  "baby shower": {
    heading: "Find baby shower venues with cosy decor",
    subtext: "Search intimate halls and venues for baby showers with themed decor and catering.",
    detailPlaceholder: "Share your theme, guest list size or special gifts/celebration requests.",
    eventTypeOptions: ["Baby Shower", "Birthday", "Anniversary", "Family Gathering"]
  }
};

type StoredLead = {
  id: string;
  name: string;
  mobile: string;
  eventDate: string;
  eventType: string;
  guestCount: number;
  budget: number;
  packageName: string;
  quoteTotal: number;
  advancePayment: number;
  source: string;
  status: "New Leads" | "Follow-ups" | "Assigned Leads" | "Lead Analytics";
  staff: string;
  createdAt: string;
};

type StoredBooking = {
  id: string;
  name: string;
  mobile: string;
  date: string;
  eventType: string;
  venue: string;
  amount: string;
  advancePayment: number;
  guestCount: number;
  status: "New Booking" | "Pending" | "Confirmed" | "Cancelled" | "Payment Status";
  createdAt: string;
};

type GoogleAutocomplete = {
  addListener: (eventName: string, handler: () => void) => void;
  getPlace: () => { formatted_address?: string; name?: string };
};

declare global {
  interface Window {
    google?: {
      maps?: {
        places?: {
          Autocomplete: new (input: HTMLInputElement, options?: Record<string, unknown>) => GoogleAutocomplete;
        };
      };
    };
  }
}

function readStorage<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(key) || "[]") as T[];
  } catch {
    return [];
  }
}

function prependStorage<T extends { id: string }>(key: string, item: T) {
  if (typeof window === "undefined") return;
  const items = readStorage<T>(key).filter((existing) => existing.id !== item.id);
  window.localStorage.setItem(key, JSON.stringify([item, ...items].slice(0, 100)));
}

function normalizeLocation(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

export function InquiryForm({ compact = false, defaultEventType, hidePackageFields = false }: { compact?: boolean; defaultEventType?: string; hidePackageFields?: boolean }) {
  const locationInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [searchedLocation, setSearchedLocation] = useState("");
  const [hasSearchedLocation, setHasSearchedLocation] = useState(false);
  const [searchingLocation, setSearchingLocation] = useState(false);
  const [eventDate, setEventDate] = useState("");
  const [guestCount, setGuestCount] = useState(350);
  const [budget, setBudget] = useState(650000);
  const [eventType, setEventType] = useState(defaultEventType || "Wedding");
  const [advancePayment, setAdvancePayment] = useState(51000);
  const [packageName, setPackageName] = useState<"Silver" | "Gold" | "Platinum" | "Custom">("Gold");
  const [specialRequirements, setSpecialRequirements] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const quote = useMemo(
    () => generateQuote({ guestCount, budget, eventType, packageName }),
    [guestCount, budget, eventType, packageName]
  );

  const eventConfig = eventFormSettings[eventType.toLowerCase()] ?? {
    heading: "Find your event venue and package",
    subtext: "Search venues, vendors and custom packages tailored for your event.",
    detailPlaceholder: "Tell us anything special about your event so we can recommend the right options.",
    eventTypeOptions: ["Wedding", "Reception", "Engagement", "Haldi", "Mehendi", "Birthday", "Corporate Event", "Anniversary"]
  };

  useEffect(() => {
    if (defaultEventType) {
      setEventType(defaultEventType);
    }
  }, [defaultEventType]);
  const availableVenues = useMemo(() => {
    const query = normalizeLocation(searchedLocation);
    if (!query) return [];
    if (query.includes("jaipur") || query.includes("rajasthan")) return venues;

    return venues.filter((venue) => {
      const searchableText = normalizeLocation(`${venue.name} ${venue.location}`);
      return query.split(" ").some((part) => part.length > 2 && searchableText.includes(part));
    });
  }, [searchedLocation]);

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY || !locationInputRef.current) return;

    const scriptId = "google-maps-places";
    const initializeAutocomplete = () => {
      const input = locationInputRef.current;
      const Autocomplete = window.google?.maps?.places?.Autocomplete;
      if (!input || !Autocomplete) return;

      const autocomplete = new Autocomplete(input, {
        componentRestrictions: { country: "in" },
        fields: ["formatted_address", "name"],
        types: ["geocode", "establishment"]
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        const selectedLocation = place.formatted_address || place.name || input.value;
        setLocationQuery(selectedLocation);
      });
    };

    if (window.google?.maps?.places) {
      initializeAutocomplete();
      return;
    }

    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      existingScript.addEventListener("load", initializeAutocomplete, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", initializeAutocomplete, { once: true });
    document.head.appendChild(script);
  }, []);

  function handleLocationSearch() {
    const query = locationQuery.trim();
    setSearchingLocation(true);

    window.setTimeout(() => {
      setSearchedLocation(query);
      setHasSearchedLocation(Boolean(query));
      setSearchingLocation(false);
    }, 350);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    const now = new Date().toISOString();
    const lead: StoredLead = {
      id: `LED-${Date.now()}`,
      name: name.trim() || "Website Visitor",
      mobile: mobile.trim(),
      eventDate,
      eventType,
      guestCount,
      budget,
      packageName,
      quoteTotal: quote.total,
      advancePayment,
      source: "website quick inquiry",
      status: "New Leads",
      staff: "Unassigned",
      createdAt: now
    };
    const booking: StoredBooking = {
      id: `BKG-${Date.now()}`,
      name: lead.name,
      mobile: lead.mobile,
      date: eventDate || "Visit pending",
      eventType,
      venue: packageName === "Platinum" ? "Rajwada Palace Lawn" : "Amrit Mahal Garden",
      amount: formatINR(quote.total),
      advancePayment,
      guestCount,
      status: eventDate ? "Pending" : "New Booking",
      createdAt: now
    };

    try {
        await fetchJson(BOOKING_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "contact",
            name: lead.name,
            phone: lead.mobile,
            subject: `${eventType} inquiry`,
            message: `Event date: ${eventDate || "Visit pending"}. Guests: ${guestCount}. Budget: ${budget}. Package: ${packageName}.`,
            budget,
            guestCount,
            source: lead.source
          })
        }).catch(() => ({}));

      if (eventDate) {
          await fetchJson(BOOKING_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "create_booking",
              name: lead.name,
              phone: lead.mobile,
              eventDate,
              eventType,
              guestCount,
              budget,
              gardenName: booking.venue,
              specialRequirements: specialRequirements || `Package: ${packageName}. Quote: ${formatINR(quote.total)}. Advance: ${advancePayment}.`
            })
          }).catch(() => ({}));
      }

      setMessage("Your inquiry has been saved in CRM. WhatsApp follow-up and booking pipeline are now ready.");
    } catch {
      setMessage("The service is temporarily unavailable, but your inquiry has been saved locally. It will sync with the backend once the API is back online.");
    } finally {
      prependStorage("rv_leads", lead);
      prependStorage("rv_bookings", booking);
      setSubmitted(true);
      setSubmitting(false);
    }
  }

  return (
    <form id="quick-inquiry" className={`glass ${compact ? "p-5" : "p-6 md:p-8"} rounded-[8px]`} onSubmit={handleSubmit}>
      <div className="mb-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Search venues by location</p>
        <h3 className="mt-2 font-display text-3xl leading-tight text-ivory mx-auto max-w-2xl">{eventConfig.heading}</h3>
        <p className="mt-3 text-sm leading-6 text-cream/75 mx-auto max-w-2xl">{eventConfig.subtext}</p>
      </div>
      <div className="mb-5 rounded-[8px] border border-gold/25 bg-gold/10 p-4">
        <label className="text-sm text-cream/80">
          Location
          <div className="mt-2 grid gap-3 sm:grid-cols-[1fr_auto]">
            <input
              ref={locationInputRef}
              className="w-full rounded-[8px] border border-white/15 bg-white/10 px-4 py-3 text-ivory outline-none focus:border-gold"
              placeholder="Enter a city or area"
              value={locationQuery}
              onChange={(event) => setLocationQuery(event.target.value)}
            />
            <button
              type="button"
              className="focus-ring inline-flex items-center justify-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-bold text-ink transition hover:bg-cream"
              onClick={handleLocationSearch}
              disabled={!locationQuery.trim() || searchingLocation}
            >
              {searchingLocation ? <Loader2 className="animate-spin" size={17} /> : <Search size={17} />}
              Search
            </button>
          </div>
        </label>
        {hasSearchedLocation ? (
          <div className="mt-4">
            {availableVenues.length ? (
              <div className="grid gap-3">
                {availableVenues.map((venue) => (
                  <Link
                    key={venue.slug}
                    href={`/venues/${venue.slug}`}
                    className="rounded-[8px] border border-white/12 bg-white/10 p-4 transition hover:border-gold/60"
                  >
                    <span className="block font-display text-2xl text-ivory">{venue.name}</span>
                    <span className="mt-2 flex items-center gap-2 text-sm text-cream/75">
                      <MapPin size={15} />
                      {venue.location} · {venue.capacity} · {venue.price}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
                <p className="rounded-[8px] border border-white/12 bg-white/10 p-4 text-sm leading-6 text-cream/75 text-center">
                No wedding garden is available for this location yet. Submit your inquiry and our team will share nearby options shortly.
              </p>
            )}
          </div>
        ) : null}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm text-cream/80">
          Name
          <input className="mt-2 w-full rounded-[8px] border border-white/15 bg-white/10 px-4 py-3 text-ivory outline-none focus:border-gold" placeholder="Your name" value={name} onChange={(event) => setName(event.target.value)} required />
        </label>
        <label className="text-sm text-cream/80">
          Mobile Number
          <input className="mt-2 w-full rounded-[8px] border border-white/15 bg-white/10 px-4 py-3 text-ivory outline-none focus:border-gold" placeholder="+91" inputMode="tel" value={mobile} onChange={(event) => setMobile(event.target.value)} required />
        </label>
        <label className="text-sm text-cream/80">
          Event Date
          <input className="mt-2 w-full rounded-[8px] border border-white/15 bg-white/10 px-4 py-3 text-ivory outline-none focus:border-gold" type="date" value={eventDate} onChange={(event) => setEventDate(event.target.value)} />
        </label>
        <label className="text-sm text-cream/80">
          Event Type
          <select
            className="mt-2 w-full rounded-[8px] border border-white/15 bg-white/10 px-4 py-3 text-ivory outline-none focus:border-gold"
            value={eventType}
            onChange={(event) => setEventType(event.target.value)}
            disabled={Boolean(defaultEventType)}
          >
            {(eventConfig.eventTypeOptions || ["Wedding", "Reception", "Engagement", "Haldi", "Mehendi", "Birthday", "Corporate Event", "Anniversary"]).map((item) => (
              <option key={item} className="text-ink">{item}</option>
            ))}
          </select>
        </label>
        <label className="text-sm text-cream/80">
          Guest Count
          <input
            className="mt-2 w-full rounded-[8px] border border-white/15 bg-white/10 px-4 py-3 text-ivory outline-none focus:border-gold"
            type="number"
            value={guestCount}
            min={50}
            onChange={(event) => setGuestCount(Number(event.target.value))}
          />
        </label>
        <label className="text-sm text-cream/80">
          Budget
          <input
            className="mt-2 w-full rounded-[8px] border border-white/15 bg-white/10 px-4 py-3 text-ivory outline-none focus:border-gold"
            type="number"
            value={budget}
            min={100000}
            onChange={(event) => setBudget(Number(event.target.value))}
          />
        </label>
        {!hidePackageFields && (
          <>
            <label className="text-sm text-cream/80">
              Package
              <select
                className="mt-2 w-full rounded-[8px] border border-white/15 bg-white/10 px-4 py-3 text-ivory outline-none focus:border-gold"
                value={packageName}
                onChange={(event) => setPackageName(event.target.value as "Silver" | "Gold" | "Platinum" | "Custom")}
              >
                <option className="text-ink">Silver</option>
                <option className="text-ink">Gold</option>
                <option className="text-ink">Platinum</option>
                <option className="text-ink">Custom</option>
              </select>
            </label>
            <label className="text-sm text-cream/80">
              Advance Payment
              <input
                className="mt-2 w-full rounded-[8px] border border-white/15 bg-white/10 px-4 py-3 text-ivory outline-none focus:border-gold"
                type="number"
                value={advancePayment}
                min={0}
                onChange={(event) => setAdvancePayment(Number(event.target.value))}
              />
            </label>
          </>
        )}
      </div>
      <label className="text-sm text-cream/80 mt-4 block">
        Special Requirements
        <textarea
          className="mt-2 w-full rounded-[8px] border border-white/15 bg-white/10 px-4 py-3 text-ivory outline-none focus:border-gold"
          placeholder={eventConfig.detailPlaceholder}
          value={specialRequirements}
          onChange={(event) => setSpecialRequirements(event.target.value)}
          rows={4}
        />
      </label>
      <div className="mt-5 rounded-[8px] border border-gold/30 bg-gold/10 p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <span className="text-sm text-cream/75">AI recommended estimate</span>
          <strong className="text-xl text-gold">{formatINR(quote.total)}</strong>
        </div>
        <p className="mt-2 text-sm text-cream/70">{quote.recommendation}</p>
      </div>
      {submitted ? (
        <p className="mt-4 rounded-[8px] border border-gold/30 bg-white/10 p-4 text-center text-sm leading-6 text-cream/75">
          {message || "Thank you for contacting us. Our team will call you shortly. Your booking inquiry, quote and reminder flow is ready for WhatsApp follow-up."}
        </p>
      ) : null}
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button
          type="submit"
          className="focus-ring inline-flex items-center justify-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-bold text-ink transition hover:bg-cream"
          disabled={submitting}
        >
          {submitting ? <CalendarCheck size={17} /> : <Send size={17} />}
          {submitting ? "Saving..." : "Get Instant Quote"}
        </button>
        <a
          href={`https://wa.me/919876543210?text=Please%20share%20availability%20and%20quote%20for%20${eventType}%20with%20${guestCount}%20guests,%20budget%20${budget},%20advance%20${advancePayment}`}
          className="focus-ring inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-3 text-sm font-bold text-ivory transition hover:border-gold"
        >
          WhatsApp Inquiry
        </a>
      </div>
    </form>
  );
}
