import Link from "next/link";
import { FloatingCTA } from "@/components/floating-cta";
import { Nav } from "@/components/nav";
import { SectionHeading } from "@/components/ui";
import { API_BASE, readJson } from "@/lib/api-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Vendor Marketplace",
  description: "Approved wedding vendors for photography, makeup, DJ, cars, mehendi and pandit ji services."
};

async function getVendors() {
  try {
    const response = await fetch(`${API_BASE}/vendors`, { cache: "no-store" });
    const data = await readJson(response);
    return Array.isArray(data.vendors) ? data.vendors : [];
  } catch {
    return [];
  }
}

export default async function VendorsPage() {
  const vendors = await getVendors();

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-silk pt-28">
        <section className="section">
          <div className="container">
            <SectionHeading eyebrow="Vendor Marketplace" title="Approved vendors and live services" />
            {vendors.length ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {vendors.map((vendor: any) => (
                  <Link key={vendor.id} href={`/vendors/${vendor.slug || vendor.id}`} className="glass rounded-[8px] p-6 transition hover:-translate-y-1 hover:border-gold/45">
                    <p className="text-sm text-gold">{vendor.categories || vendor.primary_category || "Wedding Vendor"}</p>
                    <h1 className="mt-2 font-display text-3xl">{vendor.business_name}</h1>
                    <p className="mt-3 text-sm text-cream/70">{vendor.full_name} · {vendor.city || "Jaipur"}</p>
                    <p className="mt-4 text-sm text-cream/70">{vendor.service_count} approved service{Number(vendor.service_count) === 1 ? "" : "s"}.</p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-[8px] border border-gold/20 bg-white/[0.05] p-6 text-cream/74">
                No approved vendors are live yet. Approved vendor services will appear here automatically.
              </div>
            )}
          </div>
        </section>
      </main>
      <FloatingCTA />
    </>
  );
}
