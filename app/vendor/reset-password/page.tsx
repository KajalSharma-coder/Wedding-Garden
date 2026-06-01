"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { VENDOR_RESET_PASSWORD_API, fetchJson } from "@/lib/api-client";

function VendorResetPasswordForm() {
  const params = useSearchParams();
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget as HTMLFormElement;
    setStatus("saving");
    setMessage("");

    try {
      const form = new FormData(formElement);
      const result = await fetchJson(VENDOR_RESET_PASSWORD_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: String(form.get("token") || ""),
          password: String(form.get("password") || ""),
          confirmPassword: String(form.get("confirmPassword") || "")
        })
      });
      setStatus("saved");
      setMessage(result.message || "Password updated.");
      formElement.reset();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Could not reset password.");
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#090405] px-4 py-10 text-ivory">
      <section className="w-full max-w-md rounded-[8px] border border-gold/20 bg-white/[0.06] p-7">
        <h1 className="font-display text-4xl text-gold">Reset Password</h1>
        <form className="mt-6 grid gap-4" onSubmit={submit}>
          <input className="input-luxury" name="token" defaultValue={params.get("token") || ""} placeholder="Reset token" required />
          <input className="input-luxury" name="password" type="password" minLength={8} placeholder="New password" required />
          <input className="input-luxury" name="confirmPassword" type="password" minLength={8} placeholder="Confirm password" required />
          <button className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-gold px-5 py-3 text-sm font-black text-ink" disabled={status === "saving"} type="submit">
            {status === "saving" ? <Loader2 className="animate-spin" size={17} /> : null}
            Update Password
          </button>
        </form>
        {message ? <p className={`mt-4 rounded-[8px] p-3 text-sm ${status === "error" ? "bg-red-400/15 text-red-200" : "bg-emerald-400/15 text-emerald-200"}`}>{message}</p> : null}
        {status === "saved" ? <Link className="mt-4 inline-flex text-sm font-bold text-gold" href="/vendor/login">Login</Link> : null}
      </section>
    </main>
  );
}

export default function VendorResetPasswordPage() {
  return (
    <Suspense fallback={<main className="grid min-h-screen place-items-center bg-[#090405] px-4 py-10 text-ivory" />}>
      <VendorResetPasswordForm />
    </Suspense>
  );
}
