import Link from "next/link";
import { Nav } from "@/components/nav";

export default function VenueNotFound() {
  return (
    <>
      <Nav />
      <main className="flex min-h-[70vh] items-center justify-center bg-ink px-6 pt-20 text-center">
        <div className="max-w-xl">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-gold">Venue not found</p>
          <h1 className="mt-4 font-display text-5xl text-ivory">This venue is no longer available.</h1>
          <p className="mt-5 leading-7 text-cream/75">
            The venue link may be outdated or the listing may have been removed. Browse the currently available gardens to find another option.
          </p>
          <Link href="/#venues" className="mt-8 inline-flex rounded-full bg-gold px-6 py-3 font-bold text-ink transition hover:bg-cream">
            Browse venues
          </Link>
        </div>
      </main>
    </>
  );
}
