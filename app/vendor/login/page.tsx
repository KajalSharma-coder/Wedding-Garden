"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, Loader2, Mail, Settings, Sparkles } from "lucide-react";
import { VENDOR_LOGIN_API, fetchJson } from "@/lib/api-client";

export default function VendorLoginPage() {
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setMessage("");

    try {
      const form = new FormData(event.currentTarget);
      await fetchJson(VENDOR_LOGIN_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: String(form.get("email") || ""),
          password: String(form.get("password") || "")
        })
      });
      window.location.href = "/vendor-dashboard";
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Vendor login failed.");
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#090405] px-4 py-10 text-ivory">
      <section className="w-full max-w-md rounded-[8px] border border-gold/20 bg-white/[0.06] p-7 shadow-[0_30px_90px_rgba(0,0,0,0.38)]">
        <span className="grid size-14 place-items-center rounded-[8px] bg-gold text-ink"><Sparkles size={24} /></span>
        <h1 className="mt-5 font-display text-4xl text-gold">Vendor Login</h1>
        <Link className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-cream/70 transition hover:text-gold" href="/">
          <ArrowLeft size={16} /> Back to home
        </Link>
        <form className="mt-6 grid gap-4" onSubmit={submit}>
          <label className="grid gap-2 text-xs font-black uppercase tracking-[0.18em] text-cream/70">
            <span className="flex items-center gap-2"><Mail size={14} className="text-gold" />Email</span>
            <input className="input-luxury" name="email" type="email" required />
          </label>
          <label className="grid gap-2 text-xs font-black uppercase tracking-[0.18em] text-cream/70">
            <span className="flex items-center gap-2"><Settings size={14} className="text-gold" />Password</span>
            <input className="input-luxury" name="password" type="password" required />
          </label>
          <button className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-gold px-5 py-3 text-sm font-black text-ink shadow-glow transition hover:bg-cream" disabled={status === "saving"} type="submit">
            {status === "saving" ? <Loader2 className="animate-spin" size={17} /> : null}
            Login
          </button>
          <div className="flex flex-wrap justify-between gap-3 text-sm font-semibold">
            <Link className="text-gold hover:text-cream" href="/vendor/register">Register</Link>
            <Link className="text-gold hover:text-cream" href="/vendor/forgot-password">Forgot password</Link>
          </div>
        </form>
        {message ? <p className="mt-4 rounded-[8px] bg-red-400/15 p-3 text-sm text-red-200">{message}</p> : null}
      </section>
    </main>
  );
}
