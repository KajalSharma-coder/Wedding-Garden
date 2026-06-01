import { Suspense } from "react";
import { Metadata } from "next";
import { FloatingCTA } from "@/components/floating-cta";
import { Nav } from "@/components/nav";
import { ServicesMarketplace } from "@/components/services-marketplace";
import { serviceApiUrl, fetchJson } from "@/lib/api-client";

export const metadata: Metadata = {
  title: "Approved Wedding Services | Royal Vivah Gardens",
  description: "Database-driven approved wedding services with category filters, search, gallery previews, vendor details, pricing, ratings and booking CTA."
};

export default async function ServicesPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const params = await searchParams;

  // Server-side fetch of approved services so the page is rendered with live data from MySQL via the Node API.
  let initialServices: any[] = [];
  try {
    const category = params.category || "";
    const url = serviceApiUrl({ action: "marketplace_services", category });
    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();
    initialServices = Array.isArray(data.services) ? data.services : [];
  } catch {
    initialServices = [];
  }

  return (
    <>
      <Nav />
      <Suspense fallback={<main className="min-h-screen bg-ink pt-24 text-ivory" />}>
        <ServicesMarketplace initialCategory={params.category || ""} initialServices={initialServices} />
      </Suspense>
      <FloatingCTA />
    </>
  );
}
