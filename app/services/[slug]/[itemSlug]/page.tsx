import { Metadata } from "next";
import { notFound } from "next/navigation";
import { FloatingCTA } from "@/components/floating-cta";
import { LocalMedia } from "@/components/local-media";
import { Nav } from "@/components/nav";
import { ServiceReviewForm } from "@/components/service-review-form";
import { API_BASE, readJson } from "@/lib/api-client";
import { getMarketplaceServiceBySlug } from "@/lib/marketplace-store";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ itemSlug: string }> }): Promise<Metadata> {
  const { itemSlug } = await params;
  const service = await getMarketplaceServiceBySlug(itemSlug);

  return {
    title: service ? `${service.name} | Royal Vivah Gardens` : "Approved Service",
    description: service?.description || "Approved vendor service with gallery, pricing, vendor details and booking."
  };
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ itemSlug: string }> }) {
  const { itemSlug } = await params;
  const service = await getMarketplaceServiceBySlug(itemSlug);
  if (!service) notFound();

  const images: string[] = service.gallery.length ? service.gallery : [service.image].filter(Boolean);
  const apiOrigin = API_BASE.replace(/\/api\/?$/, "");
  const imageHref = (image: string) => image.startsWith("/uploads/") ? `${apiOrigin}${image}` : image;
  let reviews: any[] = [];
  try {
    const response = await fetch(`${API_BASE}/services/${encodeURIComponent(service.slug || service.id)}/reviews`, { cache: "no-store" });
    const data = await readJson(response);
    reviews = data.reviews || [];
  } catch {
    reviews = [];
  }

  return (
    <>
      <Nav />
      <main className="min-h-screen bg-ink pt-24 text-ivory">
        <section className="section bg-silk">
          <div className="container grid gap-8 lg:grid-cols-[1.15fr_.85fr]">
            <div>
              <div className="overflow-hidden rounded-[8px] border border-white/12">
                <LocalMedia src={service.image || images[0]} alt={service.name} className="h-[420px]" overlay />
              </div>
              <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                {images.map((image: string, index: number) => (
                  <a key={`${image}-${index}`} href={imageHref(image)} className="block h-24 w-32 shrink-0 overflow-hidden rounded-[8px] border border-white/12" target="_blank" rel="noreferrer">
                    <LocalMedia src={image} alt={`${service.name} gallery ${index + 1}`} className="h-full" />
                  </a>
                ))}
              </div>
            </div>

            <aside className="rounded-[8px] border border-gold/20 bg-white/[0.06] p-6">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-gold">{service.category}</p>
              <h1 className="mt-3 font-display text-4xl leading-tight text-ivory">{service.name}</h1>
              <p className="mt-3 text-cream/72">{service.businessName}</p>
              <p className="mt-5 text-sm leading-7 text-cream/72">{service.description}</p>
              <div className="mt-6 grid gap-3 text-sm text-cream/78">
                <span>Pricing: <strong className="text-gold">{service.pricing}</strong></span>
                <span>Location: {service.location || "Jaipur"}</span>
                <span>Availability: {service.availability}</span>
                {service.capacity ? <span>Capacity: {service.capacity}</span> : null}
                <span>Rating: {service.rating}</span>
              </div>
              {service.features.length ? (
                <div className="mt-6 flex flex-wrap gap-2">
                  {service.features.map((feature: string) => (
                    <span key={feature} className="rounded-full border border-white/12 px-3 py-1 text-xs text-cream/70">{feature}</span>
                  ))}
                </div>
              ) : null}
              <div className="mt-7 grid gap-3">
                <a href={`/book/${encodeURIComponent(service.slug)}?serviceId=${encodeURIComponent(service.id)}`} className="inline-flex justify-center rounded-full bg-gold px-5 py-3 text-sm font-black text-ink transition hover:bg-cream">
                  Book This Service
                </a>
                {service.whatsappNumber ? (
                  <a href={`https://wa.me/${service.whatsappNumber.replace(/\D/g, "")}`} className="inline-flex justify-center rounded-full border border-white/15 px-5 py-3 text-sm font-bold text-ivory transition hover:border-gold hover:text-gold">
                    WhatsApp Vendor
                  </a>
                ) : null}
              </div>
            </aside>
          </div>
        </section>

        <section className="section bg-ivory text-ink">
          <div className="container grid gap-8 lg:grid-cols-[1fr_420px]">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-maroon">Reviews</p>
              <h2 className="mt-3 font-display text-4xl text-maroon">Customer feedback</h2>
              <div className="mt-6 grid gap-4">
                {reviews.length ? reviews.map((review) => (
                  <article key={review.id} className="rounded-[8px] border border-maroon/10 bg-white p-5 shadow-xl">
                    <p className="text-gold">{"★".repeat(Number(review.rating || 5))}</p>
                    <p className="mt-3 text-sm leading-7 text-ink/70">{review.review}</p>
                    <strong className="mt-3 block text-sm text-maroon">{review.customer_name}</strong>
                  </article>
                )) : (
                  <div className="rounded-[8px] border border-maroon/10 bg-white p-5 text-sm text-ink/65 shadow-xl">No approved reviews yet.</div>
                )}
              </div>
            </div>
            <ServiceReviewForm serviceId={service.id} />
          </div>
        </section>
      </main>
      <FloatingCTA />
    </>
  );
}
