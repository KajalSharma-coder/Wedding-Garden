import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Star } from "lucide-react";
import { FloatingCTA } from "@/components/floating-cta";
import { LocalMedia } from "@/components/local-media";
import { Nav } from "@/components/nav";
import { API_BASE, readJson } from "@/lib/api-client";
import { slugFromCategory } from "@/lib/marketplace-store";

export const dynamic = "force-dynamic";

async function getVendor(slug: string) {
  try {
    const response = await fetch(`${API_BASE}/vendors/${encodeURIComponent(slug)}`, { cache: "no-store" });
    return readJson(response);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await getVendor(slug);
  const vendor = data?.vendor;
  return {
    title: vendor ? `${vendor.business_name} Vendor Details and Reviews` : "Vendor Details",
    description: vendor ? `${vendor.business_name} profile, services, gallery, contact and reviews.` : undefined
  };
}

export default async function VendorDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getVendor(slug);
  if (!data?.vendor) notFound();

  const { vendor, services = [], gallery = [], reviews = [] } = data;

  return (
    <>
      <Nav />
      <main className="bg-ink pt-28 text-ivory">
        <section className="section">
          <div className="container grid gap-8 lg:grid-cols-[.85fr_1.15fr]">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.26em] text-gold">Business Profile</p>
              <h1 className="mt-4 font-display text-4xl leading-tight sm:text-6xl">{vendor.business_name}</h1>
              <p className="mt-4 text-cream/72">{vendor.full_name} · {vendor.city || "Jaipur"}</p>
              {vendor.bio ? <p className="mt-5 leading-8 text-cream/72">{vendor.bio}</p> : null}
              <div className="mt-6 grid gap-3 text-sm text-cream/75">
                <span>Contact: {vendor.phone || "Available on inquiry"}</span>
                <span>Email: {vendor.email || "Available on inquiry"}</span>
                {vendor.address ? <span>Address: {vendor.address}</span> : null}
              </div>
            </div>
            <div className="overflow-hidden rounded-[8px] border border-gold/20 bg-white/[0.05]">
              <LocalMedia src={vendor.profile_image || services[0]?.cover_image || "/og.svg"} alt={vendor.business_name} className="h-[420px]" overlay />
            </div>
          </div>
        </section>

        <section className="section bg-silk">
          <div className="container">
            <h2 className="font-display text-4xl text-gold">Services</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service: any) => (
                <Link key={service.id} href={`/services/${slugFromCategory(service.category)}/${service.slug || service.id}`} className="glass rounded-[8px] p-5">
                  <h3 className="font-display text-2xl">{service.service_name}</h3>
                  <p className="mt-2 text-sm text-cream/65">{service.category}</p>
                  <p className="mt-3 text-sm text-gold">INR {Number(service.price || 0).toLocaleString("en-IN")}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <h2 className="font-display text-4xl text-gold">Gallery</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {gallery.map((image: any) => (
                <LocalMedia key={image.id} src={image.file_path} alt={vendor.business_name} className="h-56 rounded-[8px] border border-white/10" />
              ))}
            </div>
          </div>
        </section>

        <section className="section bg-silk">
          <div className="container grid gap-6 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-4xl text-gold">Reviews</h2>
              <div className="mt-5 grid gap-4">
                {reviews.length ? reviews.map((review: any) => (
                  <article key={review.id} className="glass rounded-[8px] p-5">
                    <p className="flex items-center gap-2 text-gold"><Star className="fill-gold" size={17} /> {review.rating}</p>
                    <p className="mt-3 text-sm leading-7 text-cream/72">{review.feedback}</p>
                    <strong className="mt-3 block text-ivory">{review.customer_name}</strong>
                  </article>
                )) : <p className="text-cream/70">Reviews will appear after admin approval.</p>}
              </div>
            </div>
            <div className="glass rounded-[8px] p-6">
              <h2 className="font-display text-4xl text-gold">Contact</h2>
              <p className="mt-4 text-sm leading-7 text-cream/72">Use any approved service page to send a booking inquiry. Leads are routed to this vendor dashboard and admin dashboard.</p>
            </div>
          </div>
        </section>
      </main>
      <FloatingCTA />
    </>
  );
}
