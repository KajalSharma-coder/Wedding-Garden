"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Loader2 } from "lucide-react";
import { VENDOR_FORGOT_PASSWORD_API, fetchJson } from "@/lib/api-client";

export default function VendorForgotPasswordPage() {
  const [status, setStatus] = useState<"idle" | "saving" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");
  const [token, setToken] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setMessage("");
    setToken("");

    try {
      const form = new FormData(event.currentTarget);
      const result = await fetchJson(VENDOR_FORGOT_PASSWORD_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: String(form.get("email") || "") })
      });
      setStatus("sent");
      setMessage(result.message || "Reset instructions generated.");
      setToken(result.resetToken || "");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Could not start password reset.");
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#090405] px-4 py-10 text-ivory">
      <section className="w-full max-w-md rounded-[8px] border border-gold/20 bg-white/[0.06] p-7">
        <h1 className="font-display text-4xl text-gold">Forgot Password</h1>
        <form className="mt-6 grid gap-4" onSubmit={submit}>
          <input className="input-luxury" name="email" type="email" placeholder="vendor@example.com" required />
          <button className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-gold px-5 py-3 text-sm font-black text-ink" disabled={status === "saving"} type="submit">
            {status === "saving" ? <Loader2 className="animate-spin" size={17} /> : null}
            Send Reset Link
          </button>
        </form>
        {message ? <p className={`mt-4 rounded-[8px] p-3 text-sm ${status === "error" ? "bg-red-400/15 text-red-200" : "bg-emerald-400/15 text-emerald-200"}`}>{message}</p> : null}
        {token ? <Link className="mt-4 inline-flex text-sm font-bold text-gold" href={`/vendor/reset-password?token=${encodeURIComponent(token)}`}>Open reset page</Link> : null}
      </section>
    </main>
  );
}
