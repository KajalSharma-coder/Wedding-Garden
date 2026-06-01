"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Camera,
  Car,
  ChefHat,
  ChevronDown,
  ChevronRight,
  Gem,
  Headphones,
  Leaf,
  Menu,
  Mic2,
  Paintbrush,
  Search,
  Sparkles,
  X
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { fetchJson, serviceApiUrl } from "@/lib/api-client";

const leadingLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/#about" }
];

const trailingLinks = [
  { label: "Gallery", href: "/gallery" },
  { label: "Blog", href: "/blog" },
  { label: "FAQs", href: "/#faqs" },
  { label: "Contact", href: "/contact" }
];

type MenuItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const vendorLinks: MenuItem[] = [
  { label: "Gardens", href: "/services/gardens", icon: Leaf },
  { label: "Decoration", href: "/services/decoration", icon: Paintbrush },
  { label: "Photography", href: "/services/photography", icon: Camera },
  { label: "Pandit Ji", href: "/services/pandit-ji", icon: Gem },
  { label: "Makeup Artists", href: "/services/makeup-artists", icon: Sparkles },
  { label: "Mehendi Artists", href: "/services/mehendi-artists", icon: Paintbrush },
  { label: "Caterers", href: "/services/caterers", icon: ChefHat },
  { label: "DJ Band", href: "/services/dj-band", icon: Headphones },
  { label: "Anchor", href: "/services/anchor", icon: Mic2 },
  { label: "Car & Bus", href: "/services/transport", icon: Car }
];

const eventLinks: MenuItem[] = [
  { label: "Destination Wedding", href: "/events/destination-wedding", icon: Gem },
  { label: "Corporate Events", href: "/events/corporate-events", icon: Mic2 },
  { label: "Resorts", href: "/events/resorts", icon: Leaf },
  { label: "Banquet Halls", href: "/events/banquet-halls", icon: Sparkles }
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [vendorsOpen, setVendorsOpen] = useState(false);
  const [locationSearchOpen, setLocationSearchOpen] = useState(false);
  const [locationQuery, setLocationQuery] = useState("");
  const [locationResults, setLocationResults] = useState<any[]>([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [searchSubmittedAt, setSearchSubmittedAt] = useState<number | null>(null);
  const locationInputRef = useRef<HTMLInputElement | null>(null);
  const pathname = usePathname();
  const servicesActive = pathname === "/services" || pathname.startsWith("/services/") || pathname.startsWith("/events/");

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const closeMobileMenu = () => {
    setOpen(false);
    setServicesOpen(false);
    setVendorsOpen(false);
  };

  const normalizeFilter = (value: unknown) => String(value ?? "").trim().toLowerCase();

  const filterServicesByLocation = (services: any[], query: string) => {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];
    return services.filter((service) => {
      return [service.location, service.businessName, service.name, service.category, service.description]
        .some((field) => normalizeFilter(field).includes(needle));
    });
  };

  useEffect(() => {
    if (locationSearchOpen) {
      locationInputRef.current?.focus();
    }
  }, [locationSearchOpen]);

  const searchLocationServices = async (query: string) => {
    setLocationError("");
    setLocationLoading(true);
    setSearchSubmittedAt(Date.now());

    try {
      const data = await fetchJson(serviceApiUrl({ action: "marketplace_services" }), { cache: "no-store" });
      const services = Array.isArray(data.services) ? data.services : [];
      setLocationResults(filterServicesByLocation(services, query));
    } catch (error) {
      setLocationError("Unable to load location services. Please try again.");
      setLocationResults([]);
    } finally {
      setLocationLoading(false);
    }
  };

  const handleLocationSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = locationQuery.trim();
    if (!query) return;
    searchLocationServices(query);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-gold/20 bg-ink/90 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      <nav className="container flex min-h-20 items-center justify-between gap-5 py-3">
        <Link href="/" className="flex min-w-0 items-center gap-3" aria-label="Royal Vivah Gardens home">
          <span className="grid size-11 place-items-center rounded-full bg-gold text-ink">
            <Sparkles size={20} />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-display text-lg text-ivory sm:text-xl">Royal Vivah</span>
            <span className="block text-xs uppercase tracking-[0.28em] text-gold">Gardens</span>
          </span>
        </Link>
        <div className="hidden items-center gap-6 xl:flex">
          {leadingLinks.map((link) => (
            <Link key={link.label} href={link.href} className="text-sm font-semibold text-cream/90 transition hover:text-gold">
              {link.label}
            </Link>
          ))}
          <div
            className="relative"
            onMouseEnter={() => setServicesOpen(true)}
            onMouseLeave={() => setServicesOpen(false)}
          >
            <button
              className={`inline-flex items-center gap-1 text-sm font-semibold transition hover:text-gold ${
                servicesActive ? "text-gold" : "text-cream/90"
              }`}
              onClick={() => setServicesOpen((value) => !value)}
              type="button"
              aria-expanded={servicesOpen}
            >
              Services
              <ChevronDown size={15} className={`transition ${servicesOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {servicesOpen ? (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 12, scale: 0.98 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="absolute left-1/2 top-full w-[800px] -translate-x-1/2 pt-3 z-50"
                >
                  <div className="grid grid-cols-[250px_1fr] gap-6 rounded-[12px] border border-gold/45 bg-[#080405]/[0.98] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.72)] ring-1 ring-white/10 backdrop-blur-2xl">
                    <div className="flex flex-col gap-2 border-r border-white/10 pr-4">
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gold mb-2">Services Overview</p>
                      <Link
                        href="/services"
                        className={`flex items-center gap-3 rounded-[8px] px-4 py-2.5 text-sm font-semibold transition hover:bg-gold/15 hover:text-gold ${
                          pathname === "/services" ? "bg-gold/15 text-gold" : "text-ivory"
                        }`}
                      >
                        <Sparkles size={16} />
                        Services Overview
                      </Link>
                      <p className="mt-3 px-4 text-[11px] font-black uppercase tracking-[0.2em] text-gold">Events</p>
                      {eventLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className={`flex items-center gap-3 rounded-[8px] px-4 py-2.5 text-sm font-semibold transition hover:bg-gold/15 hover:text-gold ${
                            isActive(link.href) ? "bg-gold/15 text-gold" : "text-ivory"
                          }`}
                        >
                          <link.icon size={16} />
                          {link.label}
                        </Link>
                      ))}
                    </div>

                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gold mb-3">Vendors</p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        {vendorLinks.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-3 rounded-[8px] px-4 py-2 text-sm font-semibold transition hover:bg-gold/15 hover:text-gold ${
                              isActive(link.href) ? "bg-gold/15 text-gold" : "text-ivory"
                            }`}
                          >
                            <link.icon size={15} />
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
          {trailingLinks.map((link) => (
            <Link key={link.label} href={link.href} className="text-sm font-semibold text-cream/90 transition hover:text-gold">
              {link.label}
            </Link>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setLocationSearchOpen((value) => !value)}
          className="hidden rounded-full bg-white/10 px-5 py-3 text-sm font-semibold text-ivory ring-1 ring-white/15 transition hover:bg-gold hover:text-ink md:inline-flex"
        >
          Location
        </button>
        <button
          className="grid size-11 shrink-0 place-items-center rounded-full border border-white/15 text-ivory xl:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>
      <AnimatePresence>
        {locationSearchOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="border-t border-white/10 bg-[#090607]/[0.98]"
          >
            <div className="container py-6">
              <form onSubmit={handleLocationSearch} className="grid gap-4 sm:grid-cols-[1fr_auto]">
                <label htmlFor="location-search" className="sr-only">
                  Search by location
                </label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cream/50" />
                  <input
                    id="location-search"
                    ref={locationInputRef}
                    value={locationQuery}
                    onChange={(event) => setLocationQuery(event.target.value)}
                    placeholder="Search for city, area or venue location"
                    className="w-full rounded-[10px] border border-white/10 bg-ink px-12 py-3 text-sm text-cream outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-[10px] bg-gold px-5 py-3 text-sm font-semibold text-ink transition hover:bg-cream"
                >
                  Search
                </button>
              </form>

              <div className="mt-4 text-sm text-cream/70">
                {locationLoading
                  ? "Searching available services..."
                  : searchSubmittedAt === null
                  ? "Enter a location to filter approved services."
                  : locationResults.length
                  ? `${locationResults.length} service${locationResults.length === 1 ? "" : "s"} found for “${locationQuery}”.`
                  : `No services found for “${locationQuery}”.`}
              </div>

              {locationError ? (
                <div className="mt-4 rounded-[10px] border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">
                  {locationError}
                </div>
              ) : null}

              {searchSubmittedAt !== null && !locationLoading && !locationResults.length ? (
                <div className="mt-4 rounded-[10px] border border-white/10 bg-white/[0.05] p-4 text-sm text-cream/80">
                  Try a nearby city, garden name, or venue area.
                </div>
              ) : null}

              {locationResults.length ? (
                <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {locationResults.slice(0, 6).map((service) => (
                    <Link
                      key={`${service.source || service.id}-${service.slug || service.id}`}
                      href={`/services/${String(service.category || "service").toLowerCase().replaceAll("&", "and").replaceAll(" ", "-")}/${service.slug || service.id}`}
                      className="group overflow-hidden rounded-[10px] border border-white/10 bg-white/[0.04] p-4 text-left transition hover:border-gold/40 hover:bg-white/10"
                    >
                      <p className="text-xs uppercase tracking-[0.24em] text-gold/80">
                        {service.category || "Service"}
                      </p>
                      <h3 className="mt-3 text-lg font-semibold text-ivory">{service.name || service.service_name || service.businessName}</h3>
                      <p className="mt-2 text-sm text-cream/70">{service.businessName}</p>
                      <p className="mt-3 text-sm text-cream/70">{service.location || "Location not listed"}</p>
                      <div className="mt-4 flex items-center justify-between gap-3 text-sm text-cream/80">
                        <span>{service.pricing || service.price || "Ask for pricing"}</span>
                        <span className="font-semibold text-gold">{service.rating || "—"}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          </motion.div>
        ) : null}
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="max-h-[calc(100vh-80px)] overflow-y-auto border-t border-white/10 bg-ink/95 xl:hidden"
          >
            <div className="container grid gap-2 py-4 sm:grid-cols-2">
              {leadingLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="rounded-[8px] px-4 py-3 text-sm font-semibold text-cream/80 transition hover:bg-white/10 hover:text-gold"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="rounded-[8px] text-sm font-semibold text-cream/80">
                <button
                  className={`flex w-full items-center justify-between rounded-[8px] px-4 py-3 text-left transition hover:bg-white/10 hover:text-gold ${
                    servicesActive ? "bg-white/10 text-gold" : ""
                  }`}
                  type="button"
                  onClick={() => setServicesOpen((value) => !value)}
                  aria-expanded={servicesOpen}
                >
                  <span className="inline-flex items-center gap-3">
                    <Sparkles size={17} />
                    Services
                  </span>
                  <ChevronDown size={16} className={`transition ${servicesOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence initial={false}>
                  {servicesOpen ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 grid gap-2 rounded-[8px] border border-gold/15 bg-white/[0.04] p-2">
                        <Link
                          href="/services"
                          className={`flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-sm transition hover:bg-white/10 hover:text-gold ${
                            pathname === "/services" ? "bg-gold/10 text-gold" : "text-cream/72"
                          }`}
                          onClick={closeMobileMenu}
                        >
                          <Sparkles size={16} />
                          Services Overview
                        </Link>
                        <div className="rounded-[8px] border border-white/10 p-2">
                          <p className="mb-1 px-2 text-[11px] font-black uppercase tracking-[0.18em] text-gold">Events</p>
                          {eventLinks.map((link) => (
                            <Link
                              key={link.href}
                              href={link.href}
                              className={`flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-sm transition hover:bg-white/10 hover:text-gold ${
                                isActive(link.href) ? "bg-gold/10 text-gold" : "text-cream/72"
                              }`}
                              onClick={closeMobileMenu}
                            >
                              <link.icon size={16} />
                              {link.label}
                            </Link>
                          ))}
                        </div>
                        <button
                          className={`flex w-full items-center justify-between rounded-[8px] px-3 py-2.5 text-left text-sm transition hover:bg-white/10 hover:text-gold ${
                            pathname.startsWith("/services/") ? "bg-gold/10 text-gold" : "text-cream/72"
                          }`}
                          type="button"
                          onClick={() => setVendorsOpen((value) => !value)}
                          aria-expanded={vendorsOpen}
                        >
                          <span className="inline-flex items-center gap-3">
                            <Gem size={16} />
                            Vendors
                          </span>
                          <ChevronDown size={15} className={`transition ${vendorsOpen ? "rotate-180" : ""}`} />
                        </button>
                        <AnimatePresence initial={false}>
                          {vendorsOpen ? (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.18, ease: "easeOut" }}
                              className="overflow-hidden"
                            >
                              <div className="grid gap-1 border-l border-gold/25 pl-3">
                                {vendorLinks.map((link) => (
                                  <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`flex items-center gap-3 rounded-[8px] px-3 py-2 text-sm transition hover:bg-white/10 hover:text-gold ${
                                      isActive(link.href) ? "bg-gold/10 text-gold" : "text-cream/68"
                                    }`}
                                    onClick={closeMobileMenu}
                                  >
                                    <link.icon size={15} />
                                    {link.label}
                                  </Link>
                                ))}
                              </div>
                            </motion.div>
                          ) : null}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
              {trailingLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="rounded-[8px] px-4 py-3 text-sm font-semibold text-cream/80 transition hover:bg-white/10 hover:text-gold"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <button
                type="button"
                onClick={() => {
                  setLocationSearchOpen((value) => !value);
                  setOpen(false);
                }}
                className="rounded-[8px] bg-gold px-4 py-3 text-sm font-bold text-ink"
              >
                Location
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
