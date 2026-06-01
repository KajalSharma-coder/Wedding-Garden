import { Metadata } from "next";
import { notFound } from "next/navigation";
import { FloatingCTA } from "@/components/floating-cta";
import { Nav } from "@/components/nav";
import { DynamicServiceListing } from "@/components/dynamic-service-listing";
import { getServiceCategory, serviceCategories } from "@/lib/service-system";
import { categoryFromSlug } from "@/lib/marketplace-store";

export function generateStaticParams() {
  return serviceCategories.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceCategory(slug);

  return {
    title: service ? `${service.pageTitle} | Royal Vivah Gardens` : "Wedding Service",
    description: service?.intro || "Luxury wedding service listings with vendors, pricing, ratings and booking."
  };
}

export default async function ServiceListingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = getServiceCategory(slug);
  if (!service) notFound();

  return (
    <>
      <Nav />
      <DynamicServiceListing category={categoryFromSlug(service.slug)} title={service.pageTitle} />
      <FloatingCTA />
    </>
  );
}
