import { Nav } from "@/components/nav";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <main className="min-h-screen bg-ink pt-32">
        <section className="container max-w-3xl py-16">
          <h1 className="font-display text-5xl">Privacy Policy and Terms</h1>
          <p className="mt-6 leading-8 text-cream/72">
            Royal Vivah Gardens stores inquiry, booking, payment and communication data only for event planning, support,
            analytics and compliance. Payment data is processed by PCI-compliant payment partners. Users can request data
            correction or deletion by contacting the venue office.
          </p>
          <Link href="/terms" className="mt-8 inline-flex rounded-full border border-cream/25 px-6 py-3 text-sm font-bold text-ivory">
            View Terms and Conditions
          </Link>
        </section>
      </main>
    </>
  );
}
