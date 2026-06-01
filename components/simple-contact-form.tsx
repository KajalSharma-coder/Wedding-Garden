"use client";

import { Loader2, Send } from "lucide-react";
import { useState } from "react";
import { API_BASE, readJson } from "@/lib/api-client";

export function SimpleContactForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const form = event.currentTarget;
    const body = Object.fromEntries(new FormData(form).entries());
    try {
      const response = await fetch(`${API_BASE}/contact-inquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await readJson(response);
      setMessage(data.message || "Inquiry sent successfully.");
      form.reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not send inquiry.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-4 rounded-[8px] border border-gold/20 bg-white/[0.06] p-5 shadow-2xl md:p-7">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Name"><input className="input-luxury" name="name" required placeholder="Your name" /></Field>
        <Field label="Mobile"><input className="input-luxury" name="mobile" required placeholder="+91" /></Field>
        <Field label="Email"><input className="input-luxury" name="email" type="email" placeholder="you@example.com" /></Field>
      </div>
      <Field label="Message"><textarea className="input-luxury min-h-36" name="message" required placeholder="Tell us what you are planning." /></Field>
      {message ? <p className="rounded-[8px] border border-gold/20 bg-gold/10 p-3 text-sm font-semibold text-gold">{message}</p> : null}
      <button className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-black text-ink transition hover:bg-cream disabled:opacity-60" disabled={loading} type="submit">
        {loading ? <Loader2 className="animate-spin" size={17} /> : <Send size={17} />}
        Send Inquiry
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-2 text-xs font-black uppercase tracking-[0.18em] text-cream/70">{label}{children}</label>;
}
