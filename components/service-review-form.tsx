"use client";

import { Loader2, Star } from "lucide-react";
import { useState } from "react";
import { API_BASE, readJson } from "@/lib/api-client";

export function ServiceReviewForm({ serviceId }: { serviceId: string }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget as HTMLFormElement;
    setLoading(true);
    setMessage("");
    const body = Object.fromEntries(new FormData(formElement).entries());
    try {
      const response = await fetch(`${API_BASE}/service-reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, service_id: serviceId })
      });
      const data = await readJson(response);
      setMessage(data.message || "Review submitted.");
      formElement.reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not submit review.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-4 rounded-[8px] border border-maroon/10 bg-white p-5 shadow-xl">
      <h2 className="font-display text-3xl text-maroon">Share feedback</h2>
      <input type="hidden" name="service_id" value={serviceId} />
      <input className="input-luxury light" name="booking_id" required placeholder="Completed booking ID" />
      <input className="input-luxury light" name="customer_name" required placeholder="Name" />
      <select className="input-luxury light" name="rating" defaultValue="5">
        {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} stars</option>)}
      </select>
      <textarea className="input-luxury light min-h-28" name="review" required placeholder="Review message" />
      {message ? <p className="rounded-[8px] bg-gold/15 p-3 text-sm font-semibold text-maroon">{message}</p> : null}
      <button disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-full bg-maroon px-5 py-3 text-sm font-bold text-ivory disabled:opacity-60" type="submit">
        {loading ? <Loader2 className="animate-spin" size={17} /> : <Star size={17} />}
        Submit Review
      </button>
    </form>
  );
}
