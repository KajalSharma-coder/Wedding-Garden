import { Metadata } from "next";
import { notFound } from "next/navigation";
import { FloatingCTA } from "@/components/floating-cta";
import { Nav } from "@/components/nav";
import { ServiceDetailExperience } from "@/components/service-detail-experience";
import { getGarden, getServiceCategory, getSimilarItems } from "@/lib/service-system";

export async function generateMetadata({ params }: { params: Promise<{ placeId: string }> }): Promise<Metadata> {
  const { placeId } = await params;
  const garden = getGarden(placeId);

  return {
    title: garden ? `${garden.title} | Garden Details | Royal Vivah Gardens` : "Garden Details",
    description: garden?.shortDescription || "Garden detail page with gallery, packages, amenities, FAQ, booking and contact reveal."
  };
}

export function generateStaticParams() {
  return (getServiceCategory("gardens")?.items || []).map((garden) => ({ placeId: garden.slug }));
}

export default async function GardenDetailsPage({ params }: { params: Promise<{ placeId: string }> }) {
  const { placeId } = await params;
  const garden = getGarden(placeId);
  if (!garden) notFound();

  return (
    <>
      <Nav />
      <ServiceDetailExperience
        item={garden}
        title="Gardens"
        backHref="/gardens"
        similar={getSimilarItems("gardens", garden.slug)}
        privacyMode
      />
      <FloatingCTA />
    </>
  );
}
