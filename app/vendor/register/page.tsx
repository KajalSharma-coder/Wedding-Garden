"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, BadgeCheck, Loader2 } from "lucide-react";
import { Nav } from "@/components/nav";
import { VENDOR_REGISTER_API, fetchJson } from "@/lib/api-client";

export default function VendorRegisterPage() {
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submitVendor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const password = String(data.get("password") || "");
    const confirmPassword = String(data.get("confirmPassword") || "");

    if (password.length < 8 || password !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords must match and be at least 8 characters.");
      return;
    }

    const payload = new FormData();
    payload.append("full_name", String(data.get("fullName") || ""));
    payload.append("business_name", String(data.get("businessName") || ""));
    payload.append("email", String(data.get("email") || ""));
    payload.append("phone", String(data.get("phone") || ""));
    payload.append("password", password);
    payload.append("confirm_password", confirmPassword);
    payload.append("city", String(data.get("city") || ""));

    const profileImage = data.get("profileImage");
    if (profileImage instanceof File && profileImage.size > 0) {
      payload.append("profile_image", profileImage);
    }

    setStatus("saving");
    setMessage("");

    try {
      const result = await fetchJson(VENDOR_REGISTER_API, { method: "POST", body: payload });
      setStatus("saved");
      setMessage(result.message || "Vendor account created. Please login to add services.");
      form.reset();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Vendor registration failed.");
    }
  }

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-ink pt-28 text-cream">
        <section className="section bg-[linear-gradient(135deg,rgba(91,16,32,.92),rgba(9,5,6,.96)),url('https://images.unsplash.com/photo-1519167758481-83f29c7c90a3?auto=format&fit=crop&w=1800&q=86')] bg-cover bg-center">
          <div className="container">
            <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-gold">
              <ArrowLeft size={17} />
              Back to Home
            </Link>

            <div className="grid gap-8 lg:grid-cols-[.75fr_1.25fr] lg:items-start">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.26em] text-gold">Become a Vendor</p>
                <h1 className="mt-3 font-display text-4xl leading-tight text-ivory sm:text-6xl">Create your vendor account</h1>
                <div className="mt-8 grid gap-3">
                  {["Register your business profile", "Login to manage services", "Submit services for admin approval"].map((item) => (
                    <div key={item} className="flex items-center gap-3 rounded-[8px] border border-gold/20 bg-white/8 p-4 text-sm text-cream/78">
                      <BadgeCheck className="text-gold" size={18} />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={submitVendor} className="rounded-[8px] border border-gold/20 bg-[#12090d]/90 p-5 shadow-2xl sm:p-7">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="grid gap-2 text-sm font-semibold text-cream/80">
                    Full Name
                    <input name="fullName" required className="rounded-[8px] border border-gold/20 bg-white/8 px-4 py-3 outline-none focus:border-gold" />
                  </label>
                  <label className="grid gap-2 text-sm font-semibold text-cream/80">
                    Business Name
                    <input name="businessName" required className="rounded-[8px] border border-gold/20 bg-white/8 px-4 py-3 outline-none focus:border-gold" />
                  </label>
                  <label className="grid gap-2 text-sm font-semibold text-cream/80">
                    Email
                    <input name="email" type="email" required className="rounded-[8px] border border-gold/20 bg-white/8 px-4 py-3 outline-none focus:border-gold" />
                  </label>
                  <label className="grid gap-2 text-sm font-semibold text-cream/80">
                    Phone
                    <input name="phone" required className="rounded-[8px] border border-gold/20 bg-white/8 px-4 py-3 outline-none focus:border-gold" />
                  </label>
                  <label className="grid gap-2 text-sm font-semibold text-cream/80">
                    Password
                    <input name="password" type="password" minLength={8} required className="rounded-[8px] border border-gold/20 bg-white/8 px-4 py-3 outline-none focus:border-gold" />
                  </label>
                  <label className="grid gap-2 text-sm font-semibold text-cream/80">
                    Confirm Password
                    <input name="confirmPassword" type="password" minLength={8} required className="rounded-[8px] border border-gold/20 bg-white/8 px-4 py-3 outline-none focus:border-gold" />
                  </label>
                  <label className="grid gap-2 text-sm font-semibold text-cream/80">
                    City
                    <input name="city" required className="rounded-[8px] border border-gold/20 bg-white/8 px-4 py-3 outline-none focus:border-gold" />
                  </label>
                  <label className="grid gap-2 text-sm font-semibold text-cream/80">
                    Profile Image
                    <input name="profileImage" type="file" accept="image/*" className="rounded-[8px] border border-gold/20 bg-white/8 px-4 py-3" />
                  </label>
                </div>

                <button disabled={status === "saving"} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-[8px] bg-gold px-5 py-4 text-sm font-black text-ink transition hover:bg-cream disabled:opacity-70">
                  {status === "saving" ? <Loader2 className="animate-spin" size={18} /> : null}
                  Create Vendor Account
                </button>

                {message ? (
                  <p className={`mt-4 rounded-[8px] p-3 text-sm ${status === "error" ? "bg-red-400/15 text-red-200" : "bg-emerald-400/15 text-emerald-200"}`}>
                    {message}
                    {status === "saved" ? <Link href="/vendor/login" className="ml-2 font-bold text-gold">Login</Link> : null}
                  </p>
                ) : null}
              </form>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
