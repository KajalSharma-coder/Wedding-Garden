"use client";

import { ArrowLeft, ArrowRight, BadgeCheck, CalendarCheck2, Gem, Loader2, SearchCheck, Sparkles, TriangleAlert } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { API_BASE, fetchJson } from "@/lib/api-client";

type BudgetRange = { label: string; min: number; max: number };
type PlannerOptions = {
  eventTypes: string[];
  cities: string[];
  serviceCategories: string[];
  budgetRanges: BudgetRange[];
};
type MatchService = {
  serviceId: number;
  vendorId?: number;
  serviceName: string;
  vendorName: string;
  category: string;
  priceText: string;
  capacity: string;
  city: string;
  rating: number;
  matchPercentage: number;
};
type MatchResult = {
  matches: MatchService[];
  reasons: string[];
  suggestions: { label: string; current: string; suggested: string }[];
  overallScore: number;
  recommendedPackage: string;
};

const defaultEventTypes = ["Wedding", "Reception", "Sangeet", "Mehndi", "Haldi", "Engagement", "Cocktail", "Rehearsal Dinner"];
const defaultServiceCategories = ["Gardens", "Photography", "Catering", "Florist", "Music/DJ", "Decoration", "Makeup", "Videography"];
const emptyOptions: PlannerOptions = { eventTypes: defaultEventTypes, cities: [], serviceCategories: defaultServiceCategories, budgetRanges: [] };
const steps = ["Contact", "Event", "Services", "Matches"];

export function QuickPlanner() {
  const [options, setOptions] = useState<PlannerOptions>(emptyOptions);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [step, setStep] = useState(0);
  const [matching, setMatching] = useState(false);
  const [booking, setBooking] = useState(false);
  const [message, setMessage] = useState("");
  const [match, setMatch] = useState<MatchResult | null>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    eventDate: "",
    eventType: "",
    city: "",
    guestCount: "",
    budgetIndex: "",
    budget: "",
    requiredServices: [] as string[],
    notes: ""
  });

  useEffect(() => {
    fetchJson(`${API_BASE}/planner/options`)
      .then((data) => {
        const next = data as PlannerOptions;
        setOptions({
          ...next,
          eventTypes: next.eventTypes.length ? next.eventTypes : defaultEventTypes,
          serviceCategories: next.serviceCategories.length ? [...next.serviceCategories, ...defaultServiceCategories].filter((v, i, a) => a.indexOf(v) === i) : defaultServiceCategories
        });
        setForm((current) => ({
          ...current,
          eventType: current.eventType || next.eventTypes[0] || defaultEventTypes[0] || "",
          city: current.city || "",
          budgetIndex: current.budgetIndex || (next.budgetRanges[0] ? "0" : "")
        }));
      })
      .catch((error) => setMessage(error instanceof Error ? error.message : "Planner options could not load."))
      .finally(() => setLoadingOptions(false));
  }, []);

  const budget = useMemo(() => options.budgetRanges[Number(form.budgetIndex)] || null, [form.budgetIndex, options.budgetRanges]);
  // Prefer explicit budget text if provided; otherwise fall back to selected budgetIndex
  const explicitBudget = useMemo(() => {
    const text = (form as any).budget || "";
    if (!text) return null;
    // try to parse a number from the input (e.g. "2,25,000" or "225000")
    const digits = String(text).replace(/[^\d]/g, "");
    if (!digits) return null;
    const value = Number(digits);
    if (!value) return null;
    return { label: text, min: value, max: value } as BudgetRange;
  }, [form.budget]);

  const computedBudget = explicitBudget || options.budgetRanges[Number(form.budgetIndex)] || null;
  const canMatch = Boolean(form.eventType && form.city && Number(form.guestCount) > 0 && computedBudget && form.requiredServices.length);
  const canBook = Boolean(match?.matches.length && selected.length && form.name.trim() && form.mobile.trim() && form.eventDate);

  function update(key: keyof typeof form, value: string | string[]) {
    setForm((current) => ({ ...current, [key]: value }));
    setMessage("");
    if (["eventType", "city", "guestCount", "budgetIndex", "budget", "requiredServices", "eventDate"].includes(key)) {
      setMatch(null);
      setSelected([]);
    }
  }

  function toggleRequired(category: string) {
    const exists = form.requiredServices.includes(category);
    update("requiredServices", exists ? form.requiredServices.filter((item) => item !== category) : [...form.requiredServices, category]);
  }

  async function runMatch() {
    if (!canMatch || !budget) return;
    setMatching(true);
    setMessage("");
    try {
      const result = await fetchJson(`${API_BASE}/planner/match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload())
      }) as MatchResult;
      setMatch(result);
      setSelected(result.matches.slice(0, Math.max(1, form.requiredServices.length)).map((service) => service.serviceId));
      setStep(3);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not generate matches.");
    } finally {
      setMatching(false);
    }
  }

  async function bookPlanner() {
    if (!canBook) return;
    setBooking(true);
    setMessage("");
    try {
      const result = await fetchJson(`${API_BASE}/planner/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload(), name: form.name, mobile: form.mobile, email: form.email, notes: form.notes, selectedServiceIds: selected })
      }) as { bookingId?: string; recommendedPackage?: string; matchScore?: number };
      setMessage(`${result.bookingId || "Booking"} saved with ${result.matchScore || match?.overallScore || 0}% match.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Booking could not be saved.");
    } finally {
      setBooking(false);
    }
  }

  function payload() {
    return {
      eventType: form.eventType,
      city: form.city,
      guestCount: Number(form.guestCount || 0),
      budgetMin: budget?.min || 0,
      budgetMax: budget?.max || 0,
      requiredServices: form.requiredServices,
      eventDate: form.eventDate
    };
  }

  function nextStep() {
    if (step === 2) {
      runMatch();
      return;
    }
    setStep((value) => Math.min(3, value + 1));
  }

  const stepReady = step === 0
    ? form.name.trim() && form.mobile.trim()
    : step === 1
      ? form.eventType && form.city && form.eventDate && Number(form.guestCount) > 0 && budget
      : step === 2
        ? form.requiredServices.length > 0
        : true;

  return (
    <section className="section bg-ink text-ivory" id="quick-planner">
      <div className="container grid gap-8 lg:grid-cols-[.78fr_1.22fr] lg:items-start">
        <div className="max-w-xl">
          <p className="text-sm font-bold uppercase tracking-[0.26em] text-gold">Smart Wedding Planner</p>
          <h2 className="mt-3 font-display text-3xl leading-tight text-ivory sm:text-5xl">Validate services before booking</h2>
          <p className="mt-5 leading-8 text-cream/72">
            Our intelligent system validates every service against your location, guest capacity, budget, and availability. Booking unlocks only when a perfect match is confirmed.
          </p>
          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            {["Database matched", "Vendor notified", "Admin tracked"].map((item) => (
              <div key={item} className="rounded-[8px] border border-gold/20 bg-white/[0.06] px-4 py-3 text-sm font-bold text-gold">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[8px] border border-gold/20 bg-[#140a0e] p-5 shadow-2xl shadow-black/35 md:p-7">
          <div className="mb-6 grid grid-cols-4 gap-2">
            {steps.map((label, index) => (
              <button key={label} type="button" onClick={() => setStep(index)} className="group text-left" aria-label={label}>
                <span className={`block h-2 rounded-full transition ${index <= step ? "bg-gold" : "bg-white/12"}`} />
                <span className={`mt-2 block text-[11px] font-black uppercase tracking-[0.16em] ${index === step ? "text-gold" : "text-cream/45"}`}>{label}</span>
              </button>
            ))}
          </div>

          {loadingOptions ? <State icon={Loader2} text="Loading approved services..." spin /> : null}
          {!loadingOptions && !options.serviceCategories.length ? <State icon={TriangleAlert} text="No approved services found. Add and approve vendor services first." /> : null}

          {!loadingOptions && options.serviceCategories.length ? (
            <div className="min-h-[420px]">
              {step === 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Name"><input required value={form.name} onChange={(event) => update("name", event.target.value)} className="input-luxury" placeholder="Your name" /></Field>
                  <Field label="Mobile Number"><input required value={form.mobile} onChange={(event) => update("mobile", event.target.value)} className="input-luxury" placeholder="+91 98765 43210" /></Field>
                  <Field label="Email"><input value={form.email} onChange={(event) => update("email", event.target.value)} className="input-luxury" type="email" placeholder="you@example.com" /></Field>
                </div>
              ) : null}

              {step === 1 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Event Type">
                    <select value={form.eventType} onChange={(event) => update("eventType", event.target.value)} className="input-luxury">
                      {options.eventTypes.map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Event Date"><input required value={form.eventDate} onChange={(event) => update("eventDate", event.target.value)} className="input-luxury" type="date" /></Field>
                  <Field label="City">
                    <input required value={form.city} onChange={(event) => update("city", event.target.value)} className="input-luxury" placeholder="City" />
                  </Field>
                  <Field label="Guest Count"><input required min="1" value={form.guestCount} onChange={(event) => update("guestCount", event.target.value)} className="input-luxury" type="number" placeholder="300" /></Field>
                  <Field label="Budget"><input value={(form as any).budget} onChange={(event) => update("budget", event.target.value)} className="input-luxury" placeholder="Budget" /></Field>
                </div>
              ) : null}

              {step === 2 ? (
                <div>
                  <p className="mb-3 text-sm font-bold text-gold">Required Services</p>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {options.serviceCategories.map((category) => {
                      const active = form.requiredServices.includes(category);
                      return (
                        <button key={category} type="button" onClick={() => toggleRequired(category)} className={`min-h-12 rounded-[8px] border px-3 text-left text-sm font-bold transition ${active ? "border-gold bg-gold/18 text-gold shadow-glow" : "border-white/12 bg-white/[0.05] text-cream/72 hover:border-gold/45"}`}>
                          {category}
                        </button>
                      );
                    })}
                  </div>
                  <Field label="Notes"><textarea value={form.notes} onChange={(event) => update("notes", event.target.value)} className="input-luxury mt-5 min-h-28 resize-y" placeholder="Theme, rituals, timing or special requests" /></Field>
                </div>
              ) : null}

              {step === 3 ? <Matches match={match} selected={selected} setSelected={setSelected} /> : null}
            </div>
          ) : null}

          {message ? <p className="mt-5 rounded-[8px] border border-gold/25 bg-gold/10 p-3 text-sm font-semibold text-gold">{message}</p> : null}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <button type="button" disabled={step === 0} onClick={() => setStep((value) => Math.max(0, value - 1))} className="inline-flex items-center gap-2 rounded-[8px] border border-white/12 px-5 py-3 text-sm font-bold text-cream disabled:opacity-40">
              <ArrowLeft size={16} /> Back
            </button>
            {step < 3 ? (
              <button type="button" disabled={!stepReady || matching} onClick={nextStep} className="inline-flex items-center gap-2 rounded-[8px] bg-gold px-5 py-3 text-sm font-black text-ink shadow-glow disabled:opacity-45">
                {matching ? <Loader2 className="animate-spin" size={17} /> : step === 2 ? <SearchCheck size={17} /> : null}
                {step === 2 ? "Find Matches" : "Next"} <ArrowRight size={16} />
              </button>
            ) : (
              <button type="button" disabled={!canBook || booking} onClick={bookPlanner} className="inline-flex items-center gap-2 rounded-[8px] bg-gold px-5 py-3 text-sm font-black text-ink shadow-glow disabled:cursor-not-allowed disabled:opacity-45">
                {booking ? <Loader2 className="animate-spin" size={17} /> : <CalendarCheck2 size={17} />}
                Book Validated Plan
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Matches({ match, selected, setSelected }: { match: MatchResult | null; selected: number[]; setSelected: (ids: number[]) => void }) {
  if (!match) return <State icon={SearchCheck} text="Run matching to see approved service recommendations." />;
  if (!match.matches.length) {
    return (
      <div className="grid gap-4">
        <div className="rounded-[8px] border border-rose-300/25 bg-rose-500/10 p-4">
          <div className="flex items-center gap-2 text-rose-100"><TriangleAlert size={18} /><strong>We could not find a perfect match.</strong></div>
          <ul className="mt-3 grid gap-2 text-sm text-cream/72">{match.reasons.map((reason) => <li key={reason}>* {reason}</li>)}</ul>
        </div>
        {match.suggestions.length ? <Suggestions items={match.suggestions} /> : null}
      </div>
    );
  }
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[8px] border border-gold/25 bg-gold/10 p-4">
        <div><p className="text-xs font-black uppercase tracking-[0.18em] text-gold">Recommended Package</p><h3 className="mt-1 font-display text-2xl text-ivory">{match.recommendedPackage}</h3></div>
        <span className="inline-flex items-center gap-2 rounded-full bg-gold px-4 py-2 text-sm font-black text-ink"><Gem size={16} /> {match.overallScore}%</span>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {match.matches.map((service) => {
          const active = selected.includes(service.serviceId);
          return (
            <button key={service.serviceId} type="button" onClick={() => setSelected(active ? selected.filter((id) => id !== service.serviceId) : [...selected, service.serviceId])} className={`rounded-[8px] border p-4 text-left transition hover:-translate-y-0.5 ${active ? "border-gold bg-gold/12" : "border-white/12 bg-white/[0.045]"}`}>
              <div className="flex items-start justify-between gap-3">
                <div><h4 className="font-display text-2xl text-ivory">{service.serviceName}</h4><p className="mt-1 text-sm text-cream/58">{service.vendorName}</p></div>
                <span className="rounded-full bg-gold px-3 py-1 text-xs font-black text-ink">{service.matchPercentage}%</span>
              </div>
              <div className="mt-4 grid gap-2 text-sm text-cream/68">
                <span>{service.priceText}</span>
                <span>{service.capacity}</span>
                <span>{service.city} · {service.rating} rating</span>
              </div>
              {active ? <p className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-gold"><BadgeCheck size={16} /> Selected</p> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Suggestions({ items }: { items: MatchResult["suggestions"] }) {
  return (
    <div className="rounded-[8px] border border-gold/25 bg-white/[0.045] p-4">
      <p className="text-sm font-black uppercase tracking-[0.18em] text-gold">Smart Suggestions</p>
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        {items.map((item) => <div key={item.label} className="rounded-[8px] border border-white/10 p-3 text-sm"><strong className="text-ivory">{item.label}</strong><p className="mt-2 text-cream/55">Current: {item.current}</p><p className="text-gold">Suggested: {item.suggested}</p></div>)}
      </div>
    </div>
  );
}

function State({ icon: Icon, text, spin = false }: { icon: typeof Loader2; text: string; spin?: boolean }) {
  return <div className="grid min-h-56 place-items-center rounded-[8px] border border-white/10 bg-white/[0.035] p-6 text-center text-cream/70"><div><Icon className={`mx-auto mb-3 text-gold ${spin ? "animate-spin" : ""}`} size={28} /><p className="text-sm font-semibold">{text}</p></div></div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-2 text-sm font-bold text-gold">{label}{children}</label>;
}
