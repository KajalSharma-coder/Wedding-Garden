"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  Check,
  CreditCard,
  Heart,
  Loader2,
  Lock,
  MapPin,
  Phone,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Users,
  X
} from "lucide-react";

import type { GardenResult } from "@/lib/google-gardens";
import { API_BASE, BOOKING_API, fetchJson, readJson } from "@/lib/api-client";

const GARDEN_API = `${API_BASE}/gardens`;

type SearchResponse = {
  origin?: { lat: number; lng: number };
  gardens: GardenResult[];
  error?: string;
};

type BookingModalState = {
  garden: GardenResult;
} | null;

type UnlockModalState = {
  garden: GardenResult;
} | null;

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const eventTypes = [
  "Wedding",
  "Reception",
  "Engagement",
  "Haldi",
  "Mehendi",
  "Birthday",
  "Corporate Event"
];

function readStringArray(key: string) {
  if (typeof window === "undefined") return [];

  try {
    return JSON.parse(window.localStorage.getItem(key) || "[]") as string[];
  } catch {
    return [];
  }
}

function toggleValue(values: string[], value: string) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

function prependStorage<T extends { id: string }>(key: string, item: T) {
  if (typeof window === "undefined") return;

  try {
    const items = JSON.parse(
      window.localStorage.getItem(key) || "[]"
    ) as T[];

    window.localStorage.setItem(
      key,
      JSON.stringify(
        [item, ...items.filter((entry) => entry.id !== item.id)].slice(0, 200)
      )
    );
  } catch {
    window.localStorage.setItem(key, JSON.stringify([item]));
  }
}

function isGardenUnlocked(placeId: string) {
  if (typeof window === "undefined") return false;

  return (
    window.sessionStorage.getItem(
      `rv_unlocked_garden_${placeId}`
    ) === "true"
  );
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-[8px] border border-white/10 bg-white/[0.04]">
      <div className="h-56 animate-pulse bg-white/10" />

      <div className="space-y-3 p-5">
        <div className="h-5 w-3/4 animate-pulse rounded bg-white/10" />
        <div className="h-4 w-full animate-pulse rounded bg-white/10" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-white/10" />
      </div>
    </div>
  );
}

export function GardenSearchExperience({
  initialLocation = ""
}: {
  initialLocation?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);

  const [location, setLocation] = useState(initialLocation);
  const [gardens, setGardens] = useState<GardenResult[]>([]);
  const [origin, setOrigin] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showFilters, setShowFilters] = useState(false);

  const [budget, setBudget] = useState(400000);
  const [capacity, setCapacity] = useState(250);
  const [rating, setRating] = useState(4);

  const [parking, setParking] = useState(false);
  const [catering, setCatering] = useState(false);

  const [indoorOutdoor, setIndoorOutdoor] = useState("Any");

  const [favorites, setFavorites] = useState<string[]>([]);
  const [compare, setCompare] = useState<string[]>([]);

  const [bookingModal, setBookingModal] =
    useState<BookingModalState>(null);

  const [unlockModal, setUnlockModal] =
    useState<UnlockModalState>(null);

  const comparedGardens = useMemo(
    () =>
      gardens.filter((garden) =>
        compare.includes(garden.placeId)
      ),
    [compare, gardens]
  );

  useEffect(() => {
    setFavorites(readStringArray("rv_favorite_gardens"));
    setCompare(readStringArray("rv_compare_gardens"));
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      "rv_favorite_gardens",
      JSON.stringify(favorites)
    );
  }, [favorites]);

  useEffect(() => {
    window.localStorage.setItem(
      "rv_compare_gardens",
      JSON.stringify(compare)
    );
  }, [compare]);

  async function handleSearch(event?: FormEvent) {
    event?.preventDefault();

    if (!location.trim()) return;

    try {
      setLoading(true);
      setError("");

      const data = (await fetchJson(GARDEN_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
            location,
          filters: {
            budget,
            capacity,
            rating,
            parking,
            catering,
            indoorOutdoor
          }
        })
      })) as SearchResponse;

      if (data.error) {
        setGardens([]);
        setOrigin(null);

        setError(
          data.error ||
            "Unable to fetch venues right now."
        );

        return;
      }

      setGardens(data.gardens);
      setOrigin(data.origin || null);
    } catch (err) {
      console.log(err);

      setError("Backend connection failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-10">
        <form
          onSubmit={handleSearch}
          className="flex gap-4"
        >
          <input
            ref={inputRef}
            value={location}
            onChange={(e) =>
              setLocation(e.target.value)
            }
            placeholder="Enter city"
            className="w-full rounded border p-4 text-black"
          />

          <button
            type="submit"
            className="rounded bg-yellow-500 px-6 py-4 font-bold text-black"
          >
            {loading ? "Loading..." : "Search"}
          </button>
        </form>

        {error && (
          <div className="mt-6 rounded bg-red-500 p-4">
            {error}
          </div>
        )}

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {loading &&
            Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}

          {!loading &&
            gardens.map((garden) => (
              <div
                key={garden.placeId}
                className="overflow-hidden rounded border border-white/10 bg-white/5"
              >
                <div className="relative h-60">
                  <Image
                    src={garden.image}
                    alt={garden.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="p-5">
                  <h2 className="text-2xl font-bold">
                    {garden.name}
                  </h2>

                  <p className="mt-2 text-sm text-gray-300">
                    {garden.address}
                  </p>

                  <div className="mt-4 flex items-center gap-2">
                    <Star
                      size={16}
                      className="text-yellow-400"
                    />

                    <span>{garden.rating}</span>
                  </div>

                  <div className="mt-4">
                    <strong className="text-yellow-400">
                      {garden.price}
                    </strong>
                  </div>

                  <button
                    className="mt-5 w-full rounded bg-yellow-500 py-3 font-bold text-black"
                    onClick={() =>
                      setBookingModal({ garden })
                    }
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      <AnimatePresence>
        {bookingModal ? (
          <BookingModal
            garden={bookingModal.garden}
            onClose={() =>
              setBookingModal(null)
            }
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function BookingModal({
  garden,
  onClose
}: {
  garden: GardenResult;
  onClose: () => void;
}) {
  const [submitting, setSubmitting] =
    useState(false);

  const [confirmed, setConfirmed] =
    useState<any>(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    eventType: "Wedding",
    guestCount: 300,
    bookingDate: "",
    budget: 300000,
    specialRequirements: ""
  });

  async function submitBooking(
    event: FormEvent
  ) {
    event.preventDefault();

    try {
      setSubmitting(true);

      const response = await fetch(
        BOOKING_API,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json"
          },
          body: JSON.stringify({
            action: "create_booking",
            ...form,
            gardenName: garden.name,
            gardenAddress: garden.address,
            placeId: garden.placeId
          })
        }
      );

      const data = await readJson(response);

      setConfirmed(data);
    } catch (err) {
      console.log(err);
      alert("Booking API Failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4">
      <div className="w-full max-w-2xl rounded bg-[#111] p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">
            {garden.name}
          </h2>

          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {confirmed ? (
          <div className="mt-6">
            <h3 className="text-2xl font-bold text-green-400">
              Booking Confirmed
            </h3>

            <p className="mt-2">
              ID: {confirmed.bookingId}
            </p>
          </div>
        ) : (
          <form
            onSubmit={submitBooking}
            className="mt-6 grid gap-4"
          >
            <input
              required
              placeholder="Name"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value
                })
              }
              className="rounded border p-3 text-black"
            />

            <input
              required
              placeholder="Phone"
              value={form.phone}
              onChange={(e) =>
                setForm({
                  ...form,
                  phone: e.target.value
                })
              }
              className="rounded border p-3 text-black"
            />

            <button
              disabled={submitting}
              className="rounded bg-yellow-500 py-3 font-bold text-black"
            >
              {submitting
                ? "Submitting..."
                : "Confirm Booking"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
