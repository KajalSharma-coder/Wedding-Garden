import { FloatingCTA } from "@/components/floating-cta";
import { Nav } from "@/components/nav";
import { SimpleContactForm } from "@/components/simple-contact-form";

export default function ContactPage() {
  return (
    <>
      <Nav />
      <main className="min-h-screen bg-silk pt-32">
        <section className="container grid gap-8 py-16 lg:grid-cols-[.85fr_1.15fr] lg:items-start">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.26em] text-gold">Contact Us</p>
            <h1 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">Send a quick inquiry</h1>
            <p className="mt-6 leading-8 text-cream/72">
              Share your details and the Royal Vivah team will respond with availability, pricing and planning support.
            </p>
          </div>
          <SimpleContactForm />
        </section>
      </main>
      <FloatingCTA />
    </>
  );
}
