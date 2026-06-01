"use client";
import React from "react";
import { FormEvent, useState } from "react";
import { CalendarDays, MessageCircle, Phone, X } from "lucide-react";
import { BOOKING_API, fetchJson } from "@/lib/api-client";

type BookingModalProps = {
  title: string;
  open: boolean;
  onClose: () => void;
  onReveal?: () => void;
};

export function BookingModal({ title, open, onClose, onReveal }: BookingModalProps) {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") || ""),
      phone: String(form.get("phone") || ""),
      email: String(form.get("email") || ""),
      eventDate: String(form.get("eventDate") || ""),
      eventType: "Wedding",
      guestCount: Number(form.get("guests") || 0),
      budget: Number(String(form.get("budget") || "0").replace(/[^\d]/g, "")),
      gardenName: title,
      specialRequirements: String(form.get("requirements") || "")
    };
    const result = await fetchJson(BOOKING_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create_booking", ...payload })
    }).catch(() => ({}));
    if (!result || result.ok === false) {
      setSubmitting(false);
      return;
    }
    const now = new Date().toISOString();
    try {
      const leads = JSON.parse(window.localStorage.getItem("rv_leads") || "[]");
      const bookings = JSON.parse(window.localStorage.getItem("rv_bookings") || "[]");
      window.localStorage.setItem("rv_leads", JSON.stringify([{
        id: `LED-${Date.now()}`,
        ...payload,
        mobile: payload.phone,
        selectedGarden: title,
        message: payload.specialRequirements,
        source: "venue booking modal",
        status: "New Leads",
        staff: "Unassigned",
        createdAt: now
      }, ...leads].slice(0, 200)));
      window.localStorage.setItem("rv_bookings", JSON.stringify([{
        id: result.bookingId || `BKG-${Date.now()}`,
        name: payload.name,
        mobile: payload.phone,
        email: payload.email,
        date: payload.eventDate,
        eventType: payload.eventType,
        venue: title,
        amount: payload.budget,
        paymentStatus: "Pending",
        guestCount: payload.guestCount,
        status: "Pending",
        message: payload.specialRequirements,
        createdAt: now
      }, ...bookings].slice(0, 200)));
    } catch {
      // Browser storage may be unavailable in private contexts.
    }
    setSubmitting(false);
    onReveal?.();
    setSent(true);
  }

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-ink/82 p-4 backdrop-blur">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[8px] border border-gold/30 bg-[#140a0e] p-5 shadow-2xl md:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-gold">Booking Request</p>
            <h2 className="mt-2 font-display text-3xl text-ivory">{title}</h2>
          </div>
          <button type="button" onClick={onClose} className="grid size-10 place-items-center rounded-full border border-white/15 text-cream" aria-label="Close booking form">
            <X size={18} />
          </button>
        </div>

        {sent ? (
          <div className="mt-6 rounded-[8px] border border-gold/25 bg-gold/10 p-5">
            <h3 className="font-display text-3xl text-gold">Inquiry received</h3>
            <p className="mt-3 text-sm leading-7 text-cream/75">
              The detailed contact section is now visible on this page. Our team can confirm availability, pricing and visit timing from here.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a href="https://wa.me/919876543210" className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-bold text-ink">
                <MessageCircle size={17} /> WhatsApp Inquiry
              </a>
              <a href="tel:+919876543210" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-bold text-ivory">
                <Phone size={17} /> Call Now
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 grid gap-4 md:grid-cols-2">
            <input required name="name" placeholder="Name" className="rounded-[8px] border border-white/15 bg-white/10 px-4 py-3 text-ivory outline-none focus:border-gold" />
            <input required name="phone" placeholder="Phone" className="rounded-[8px] border border-white/15 bg-white/10 px-4 py-3 text-ivory outline-none focus:border-gold" />
            <input name="email" type="email" placeholder="Email" className="rounded-[8px] border border-white/15 bg-white/10 px-4 py-3 text-ivory outline-none focus:border-gold" />
            <input required name="eventDate" type="date" className="rounded-[8px] border border-white/15 bg-white/10 px-4 py-3 text-ivory outline-none focus:border-gold" />
            <input required name="guests" type="number" min={20} placeholder="Guests" className="rounded-[8px] border border-white/15 bg-white/10 px-4 py-3 text-ivory outline-none focus:border-gold" />
            <input required name="budget" placeholder="Budget" className="rounded-[8px] border border-white/15 bg-white/10 px-4 py-3 text-ivory outline-none focus:border-gold" />
            <textarea name="requirements" placeholder="Special / custom requirements" className="min-h-28 rounded-[8px] border border-white/15 bg-white/10 px-4 py-3 text-ivory outline-none focus:border-gold md:col-span-2" />
            <button type="submit" disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-bold text-ink transition hover:bg-cream disabled:opacity-70 md:col-span-2">
              <CalendarDays size={17} /> Submit Booking Request
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
