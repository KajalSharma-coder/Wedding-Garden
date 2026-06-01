import Link from "next/link";
import { Metadata } from "next";
import { ArrowRight, BadgeCheck, CreditCard, Facebook, Instagram, Mail, MapPinned, Phone, ShieldCheck, Star, Youtube } from "lucide-react";
import { FloatingCTA } from "@/components/floating-cta";
import { HomeGalleryPreview } from "@/components/home-gallery-preview";
import { HomeHeroCarousel } from "@/components/home-hero-carousel";
import { InquiryForm } from "@/components/inquiry-form";
import { LocalMedia } from "@/components/local-media";
import { Nav } from "@/components/nav";
import { QuickPlanner } from "@/components/quick-planner";
import { CallButton, GhostButton, PrimaryButton, SectionHeading } from "@/components/ui";
import { API_BASE, readJson } from "@/lib/api-client";
import {
  aboutHighlights,
  aiFeatures,
  blogPosts,
  crmStages,
  eventTypes,
  faqs,
  futureScaleFeatures,
  paymentMethods,
  premiumFeatures,
  securityFeatures,
  testimonials,
  venues,
  whatsappTemplates
} from "@/lib/data";
import { luxuryWeddingImages } from "@/lib/real-images";

export const metadata: Metadata = {
  title: "Luxury Wedding Garden and Event Booking in Jaipur",
  description:
    "Ultra-premium wedding garden booking website with real-time availability, packages, vendors, WhatsApp automation, CRM and AI quotation generator."
};

export const dynamic = "force-dynamic";

const fallbackHome = {
  featuredVenues: venues.map((venue) => ({
    ...venue,
    service_name: venue.name,
    cover_image: venue.image,
    features: venue.amenities
  })),
  testimonials: testimonials.map((review, index) => ({
    id: `testimonial-${index + 1}`,
    customer_name: review.name,
    feedback: review.text,
    rating: review.rating
  })),
  vendors: [],
  blog: blogPosts,
  events: eventTypes,
  statistics: { services: 0, vendors: 0, venues: 0 },
  faqs
};

function mergeHomeData(homeData: any) {
  const uniqueByKey = (list: any[], keyGetter: (item: any) => string) => {
    const seen = new Set<string>();
    return list.filter(item => {
      const k = keyGetter(item);
      if (!k || seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  };

  const rawFeaturedVenues = (homeData.featuredVenues && homeData.featuredVenues.length > 0)
    ? homeData.featuredVenues
    : fallbackHome.featuredVenues;
  const featuredVenues = uniqueByKey(rawFeaturedVenues, (v) => String(v.slug || v.id || v.name || v.service_name));

  const rawTestimonials = (homeData.testimonials && homeData.testimonials.length > 0)
    ? homeData.testimonials
    : fallbackHome.testimonials;
  const testimonials = uniqueByKey(rawTestimonials, (t) => String(t.id || t.customer_name || t.name || t.feedback || t.text));

  const rawGallery = Array.isArray(homeData.gallery) ? homeData.gallery : [];
  const gallery = uniqueByKey(rawGallery, (g) => String(g.id || g.url || g.image_url || g.image || g.file_path));

  const rawVendors = (homeData.vendors && homeData.vendors.length > 0)
    ? homeData.vendors
    : fallbackHome.vendors;
  const vendors = uniqueByKey(rawVendors, (v) => String(v.id || v.name || v.business_name));

  const rawBlog = (homeData.blog && homeData.blog.length > 0)
    ? homeData.blog
    : fallbackHome.blog;
  const blog = uniqueByKey(rawBlog, (b) => String(b.slug || b.title));

  const rawEvents = (homeData.events && homeData.events.length > 0)
    ? homeData.events
    : fallbackHome.events;
  const eventImageBySlug = new Map(eventTypes.map((event) => [event.slug, event.image]));
  let hasCorporateEvent = false;
  const events = uniqueByKey(rawEvents, (e) => String(e.slug || e.title))
    .filter((event) => {
      const key = String(event.slug || event.title || "").toLowerCase();
      const isCorporate = key === "corporate-event" || key === "corporate-events";
      if (!isCorporate) return true;
      if (hasCorporateEvent) return false;
      hasCorporateEvent = true;
      return true;
    })
    .map((event) => ({
      ...event,
      image: eventImageBySlug.get(String(event.slug)) || event.image
    }));

  const statistics = (homeData.statistics && (homeData.statistics.services > 0 || homeData.statistics.vendors > 0 || homeData.statistics.venues > 0))
    ? homeData.statistics
    : { services: 10, vendors: 24, venues: 3 };

  const rawFaqs = (homeData.faqs && homeData.faqs.length > 0)
    ? homeData.faqs
    : fallbackHome.faqs;
  const faqs = uniqueByKey(rawFaqs, (f) => String(f.question));

  return {
    featuredVenues,
    gallery,
    testimonials,
    vendors,
    blog,
    events,
    statistics,
    faqs
  };
}

async function getHomeData() {
  try {
    const response = await fetch(`${API_BASE}/home`, { cache: "no-store" });
    const homeData = await readJson(response);
    console.info("[gallery:frontend-fetch:home]", { gallery: Array.isArray(homeData.gallery) ? homeData.gallery.length : 0 });
    return mergeHomeData(homeData);
  } catch (error) {
    console.error("[gallery:frontend-fetch:home:error]", error);
    return mergeHomeData({});
  }
}

function serviceImage(item: any) {
  return item.image || item.cover_image || item.url || "/og.svg";
}

const featuredVenueImages = [
  luxuryWeddingImages.venues.royalPalace,
  luxuryWeddingImages.venues.luxuryGarden,
  luxuryWeddingImages.venues.modernBanquet,
  luxuryWeddingImages.venues.destinationResort
];

function serviceName(item: any) {
  return item.name || item.service_name || item.title || "Royal Vivah";
}

function priceText(value: unknown) {
  if (typeof value === "string" && /[a-z]/i.test(value)) return value;
  const amount = Number(value || 0);
  return amount > 0 ? `INR ${amount.toLocaleString("en-IN")}` : "On request";
}

export default async function Home() {
  const home = await getHomeData();
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: home.faqs.map((faq: any) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer }
    }))
  };

  return (
    <>
      <Nav />
      <main>
        <HomeHeroCarousel />

        <QuickPlanner />

        <section className="section bg-ivory text-ink" id="about">
          <div className="container grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-center">
            <div className="max-w-4xl">
              <p className="text-sm font-bold uppercase tracking-[0.26em] text-maroon">About Us</p>
              <h2 className="mt-3 font-display text-3xl leading-tight text-maroon sm:text-5xl">A complete wedding garden booking team for celebrations</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {aboutHighlights.map((item) => (
                <article key={item} className="rounded-[8px] border border-maroon/10 bg-white p-5 shadow-xl">
                  <BadgeCheck className="text-gold" size={24} />
                  <p className="mt-4 text-sm leading-6 text-ink/70">{item}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section bg-ink" id="venues">
          <div className="container">
            <SectionHeading
              eyebrow="Featured Venues"
              title="Palatial gardens for every celebration scale"
              text="Each venue includes pricing, media, parking, capacity, amenities, availability and booking workflow."
            />
            <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
              {home.featuredVenues.slice(0, 3).map((venue: any, index: number) => (
                <Link key={venue.slug || venue.id} href={venue.name ? `/venues/${venue.slug}` : `/services/gardens/${venue.slug || venue.id}`} className="group overflow-hidden rounded-[8px] border border-white/12 bg-white/[0.04] shadow-2xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-gold/55">
                  <div className="relative h-80">
                    <LocalMedia src={featuredVenueImages[index % featuredVenueImages.length] || serviceImage(venue)} alt={serviceName(venue)} className="h-full transition duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-transparent" />
                    <div className="absolute bottom-5 left-5 right-5">
                      <h3 className="font-display text-3xl leading-tight text-ivory">{serviceName(venue)}</h3>
                      <p className="mt-2 flex items-center gap-2 text-sm text-cream/78">
                        <MapPinned size={16} />
                        {venue.location}
                      </p>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <span className="rounded-[8px] border border-white/10 bg-white/[0.04] px-3 py-2 text-cream/78">{venue.capacity}</span>
                      <strong className="rounded-[8px] border border-gold/25 bg-gold/10 px-3 py-2 text-right text-gold">{priceText(venue.price)}</strong>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {(Array.isArray(venue.features) ? venue.features : []).slice(0, 4).map((item: string) => (
                        <span key={item} className="rounded-full border border-white/12 bg-white/[0.03] px-3 py-1 text-xs text-cream/70">
                          {item}
                        </span>
                      ))}
                    </div>
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-gold">
                      Book Now <ArrowRight size={16} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section relative overflow-hidden bg-ivory text-ink" id="testimonials">
          <div className="absolute inset-0 opacity-[0.16]">
            <LocalMedia src={luxuryWeddingImages.sections.testimonials} alt="Luxury wedding reception background" className="h-full" />
          </div>
          <div className="absolute inset-0 bg-ivory/88" />
          <div className="container relative z-10">
            <SectionHeading eyebrow="Testimonials" title="Google-style ratings and client reviews" />
            <div className="grid gap-4 md:grid-cols-3">
              {home.testimonials.map((review: any) => (
                <article key={review.id || review.customer_name} className="rounded-[8px] border border-maroon/10 bg-white p-6 shadow-xl">
                  <div className="flex items-center gap-1 text-gold">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} size={18} className="fill-gold" />
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-7 text-ink/70">{review.feedback || review.text}</p>
                  <div className="mt-5 flex items-center justify-between">
                    <strong className="text-maroon">{review.customer_name || review.name}</strong>
                    <span className="rounded-full bg-gold/20 px-3 py-1 text-sm font-bold text-maroon">{review.rating}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <HomeGalleryPreview images={home.gallery} />

        {Number(home.statistics.services || 0) > 0 ? (
          <section className="section bg-silk" id="statistics">
            <div className="container grid gap-4 md:grid-cols-3">
              {[
                ["Approved Services", home.statistics.services],
                ["Verified Vendors", home.statistics.vendors],
                ["Featured Venues", home.statistics.venues]
              ].map(([label, value]) => (
                <article key={label} className="glass rounded-[8px] p-6 text-center">
                  <strong className="font-display text-5xl text-gold">{Number(value || 0).toLocaleString("en-IN")}</strong>
                  <p className="mt-2 text-sm font-bold uppercase tracking-[0.18em] text-cream/65">{label}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section className="section bg-ivory text-ink" id="crm">
          <div className="container grid gap-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
            <div>
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.26em] text-maroon">CRM and Admin</p>
              <h2 className="font-display text-3xl leading-tight text-maroon sm:text-5xl">Bookings, leads, payments and reports in one dashboard</h2>
              <p className="mt-5 leading-8 text-ink/70">
                Capture every inquiry, assign staff, schedule follow-ups, track conversion, sync payments and automate WhatsApp replies.
              </p>
              <div className="mt-7">
                <PrimaryButton href="#quick-inquiry">Start Booking Workflow</PrimaryButton>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {crmStages.map((stage) => (
                <article key={stage.label} className="rounded-[8px] border border-maroon/10 bg-white p-6 shadow-xl">
                  <stage.icon className="text-gold" size={30} />
                  <p className="mt-5 text-sm text-ink/60">{stage.label}</p>
                  <div className="mt-2 flex items-end justify-between">
                    <strong className="text-4xl text-maroon">{stage.count}</strong>
                    <span className="font-bold text-ink/70">{stage.value}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section bg-ink">
          <div className="container">
            <SectionHeading eyebrow="AI Features" title="Smart planning and automation built in" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {aiFeatures.map((feature) => (
                <article key={feature.title} className="glass rounded-[8px] p-6">
                  <feature.icon className="mb-5 text-gold" size={32} />
                  <h3 className="font-display text-2xl">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-cream/68">{feature.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section bg-ivory text-ink">
          <div className="container grid gap-8 lg:grid-cols-3">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.26em] text-maroon">Payments and Security</p>
              <h2 className="mt-3 font-display text-3xl leading-tight text-maroon sm:text-5xl">Built for booking, payment and follow-up automation</h2>
            </div>
            <div className="rounded-[8px] bg-white p-6 shadow-xl">
              <CreditCard className="text-gold" size={30} />
              <h3 className="mt-4 font-display text-3xl text-maroon">Payment System</h3>
              <div className="mt-5 flex flex-wrap gap-2">
                {paymentMethods.map((item) => (
                  <span key={item} className="rounded-full bg-maroon/10 px-3 py-1 text-sm font-bold text-maroon">{item}</span>
                ))}
              </div>
            </div>
            <div className="rounded-[8px] bg-white p-6 shadow-xl">
              <ShieldCheck className="text-gold" size={30} />
              <h3 className="mt-4 font-display text-3xl text-maroon">Security Features</h3>
              <div className="mt-5 grid gap-2">
                {securityFeatures.map((item) => (
                  <span key={item} className="text-sm text-ink/70">{item}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section bg-silk">
          <div className="container grid gap-8 lg:grid-cols-2 lg:items-start">
            <InquiryForm hidePackageFields />
            <div className="glass rounded-[8px] p-7">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-gold">WhatsApp Automation</p>
              <h2 className="mt-3 font-display text-4xl">Templates ready for inquiry, booking and reminders</h2>
              <div className="mt-6 space-y-3">
                {whatsappTemplates.map((template) => (
                  <div key={template} className="rounded-[8px] border border-white/12 bg-white/8 p-4 text-sm text-cream/72">
                    {template}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-luxury py-16">
          <div className="container flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-cream/75">Limited premium dates open</p>
              <h2 className="mt-3 font-display text-4xl md:text-5xl">Book Your Dream Wedding Today</h2>
            </div>
            <div className="grid w-full gap-3 sm:w-auto sm:flex sm:flex-wrap">
              <CallButton />
              <GhostButton href="https://wa.me/919876543210">WhatsApp</GhostButton>
              <GhostButton href="#venues">Visit Venue</GhostButton>
            </div>
          </div>
        </section>

        <section className="section bg-ivory text-ink" id="events">
          <div className="container">
            <SectionHeading eyebrow="Events" title="Dedicated landing pages for every occasion" />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {home.events.map((event: any) => (
                <Link key={event.slug} href={`/events/${event.slug}`} className="group relative h-72 overflow-hidden rounded-[8px] border border-maroon/10 shadow-xl">
                  <LocalMedia src={event.image} alt={event.title} className="h-full transition duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/88 via-ink/18 to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-gold">Luxury Event</p>
                    <h3 className="mt-1 font-display text-3xl leading-tight text-ivory">{event.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section bg-ink" id="blog">
          <div className="container">
            <SectionHeading eyebrow="Blog" title="Wedding tips, decor ideas, bridal trends and budget planning" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {home.blog.map((post: any) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="glass rounded-[8px] p-6">
                  <p className="text-sm font-bold text-gold">{post.category}</p>
                  <h3 className="mt-3 font-display text-2xl leading-tight">{post.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-cream/68">{post.excerpt}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section bg-silk">
          <div className="container grid gap-8 lg:grid-cols-2">
            <div>
              <SectionHeading eyebrow="Premium Features" title="Luxury features ready for future scale" />
              <div className="grid gap-3 sm:grid-cols-2">
                {premiumFeatures.map((item) => (
                  <div key={item} className="glass rounded-[8px] p-4 text-sm font-semibold text-cream/80">{item}</div>
                ))}
              </div>
            </div>
            <div>
              <SectionHeading eyebrow="Future Scale" title="Multi-venue, apps and vendor subscriptions" />
              <div className="grid gap-3 sm:grid-cols-2">
                {futureScaleFeatures.map((item) => (
                  <div key={item} className="glass rounded-[8px] p-4 text-sm font-semibold text-cream/80">{item}</div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section bg-ivory text-ink" id="faqs">
          <div className="container">
            <SectionHeading eyebrow="FAQs" title="Answers before you book a visit" />
            <div className="grid gap-4 md:grid-cols-2">
              {home.faqs.map((faq: any) => (
                <article key={faq.question} className="rounded-[8px] border border-maroon/10 bg-white p-6 shadow-xl">
                  <h3 className="font-display text-2xl text-maroon">{faq.question}</h3>
                  <p className="mt-3 text-sm leading-7 text-ink/70">{faq.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t border-gold/15 bg-[#080405] text-cream">
        <div className="container grid gap-10 py-14 lg:grid-cols-[1.2fr_.7fr_.7fr_1fr]">
          <div>
            <div className="flex items-center gap-4">
              <span className="grid size-14 place-items-center rounded-full border border-gold/50 bg-gold text-xl font-black text-ink">RV</span>
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.26em] text-gold">Royal Vivah Gardens</p>
                <h2 className="font-display text-3xl leading-tight text-ivory">Luxury Wedding Venue</h2>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-cream/68">
              Venues with decoration, catering, photography, vendor marketplace, WhatsApp automation and online booking workflow.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-gold">
              {[
                { label: "Instagram", icon: Instagram, href: "https://instagram.com/royalvivahgardens" },
                { label: "Facebook", icon: Facebook, href: "https://facebook.com/royalvivahgardens" },
                { label: "YouTube", icon: Youtube, href: "https://youtube.com" }
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="grid size-11 place-items-center rounded-full border border-white/12 bg-white/5 transition hover:border-gold hover:bg-gold hover:text-ink"
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-display text-2xl text-ivory">Quick Links</h3>
            <div className="mt-4 grid gap-3 text-sm text-cream/70">
              {["About", "Venues", "Events", "Blog", "FAQs"].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} className="transition hover:text-gold">{item}</a>
              ))}
              <Link href="/services" className="transition hover:text-gold">Services</Link>
              <Link href="/vendor/register" className="transition hover:text-gold">Become a Vendor</Link>
              <Link href="/vendor-dashboard" className="transition hover:text-gold">Vendor Dashboard</Link>
              <Link href="/vendor/services" className="transition hover:text-gold">Approved Vendor Services</Link>
              <Link href="/privacy" className="transition hover:text-gold">Privacy Policy</Link>
              <Link href="/terms" className="transition hover:text-gold">Terms</Link>
            </div>
          </div>
          <div>
            <h3 className="font-display text-2xl text-ivory">Services</h3>
            <div className="mt-4 grid gap-3 text-sm text-cream/70">
              {["Gardens", "Decoration", "DJ Band", "Makeup Artists", "Pandit Ji", "Anchor", "Caterers", "Car & Bus", "Photography", "Mehendi Artists"].map((service) => (
                <Link key={service} href={`/services?category=${encodeURIComponent(service)}`} className="transition hover:text-gold">
                  {service}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-display text-2xl text-ivory">Concierge Desk</h3>
            <div className="mt-4 grid gap-3 text-sm text-cream/70">
              <p className="flex gap-3 leading-6"><MapPinned className="mt-1 shrink-0 text-gold" size={17} /> Ajmer Road, Rajasthan</p>
              <p className="flex gap-3"><Phone className="shrink-0 text-gold" size={17} /> +91 98765 43210</p>
              <p className="flex gap-3"><Mail className="shrink-0 text-gold" size={17} /> bookings@royalvivah.example</p>
            </div>
            <form className="mt-5 flex overflow-hidden rounded-[8px] border border-white/12 bg-white/5">
              <input
                aria-label="Newsletter email"
                className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-ivory outline-none placeholder:text-cream/45"
                placeholder="Email for venue updates"
                type="email"
              />
              <button className="bg-gold px-4 text-sm font-black text-ink transition hover:bg-cream" type="submit">Join</button>
            </form>
            <iframe
              title="Royal Vivah Gardens location"
              className="mt-5 h-48 w-full rounded-[8px] border border-white/12"
              loading="lazy"
              src="https://www.google.com/maps?q=Rajasthan&output=embed"
            />
          </div>
        </div>
        <div className="border-t border-white/10 py-5">
          <div className="container flex flex-col justify-between gap-3 text-sm text-cream/55 md:flex-row md:items-center">
            <span>© 2026 Royal Vivah Gardens. All rights reserved.</span>
            <div className="flex flex-wrap gap-4">
              <span>Wedding garden, marriage garden, luxury wedding venue.</span>
              <a href="/admin-login.html" className="text-cream/45 transition hover:text-gold">Admin Access</a>
            </div>
          </div>
        </div>
      </footer>
      <FloatingCTA />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    </>
  );
}
