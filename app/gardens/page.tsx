import { Metadata } from "next";
import { FloatingCTA } from "@/components/floating-cta";
import { Nav } from "@/components/nav";
import { DynamicServiceListing } from "@/components/dynamic-service-listing";

export const metadata: Metadata = {
  title: "Luxury Wedding Gardens in Jaipur | Royal Vivah Gardens",
  description: "Privacy-aware garden listings with general area, pricing, ratings and dedicated details pages."
};

export default function GardensPage() {
  return (
    <>
      <Nav />
      <DynamicServiceListing category="Gardens" title="Luxury Wedding Gardens" />
      <FloatingCTA />
    </>
  );
}
