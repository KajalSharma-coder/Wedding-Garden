import { Metadata } from "next";
import { notFound } from "next/navigation";
import { FloatingCTA } from "@/components/floating-cta";
import { InquiryForm } from "@/components/inquiry-form";
import { Nav } from "@/components/nav";
import { blogPosts } from "@/lib/data";

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((item) => item.slug === slug);
  return {
    title: post?.title || "Wedding Blog",
    description: post?.excerpt
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = blogPosts.find((item) => item.slug === slug);
  if (!post) notFound();

  return (
    <>
      <Nav />
      <main className="bg-ink pt-28">
        <section className="section">
          <div className="container grid gap-8 lg:grid-cols-[1fr_.75fr] lg:items-start">
            <article className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.26em] text-gold">{post.category}</p>
              <h1 className="mt-4 font-display text-4xl leading-tight sm:text-6xl">{post.title}</h1>
              <p className="mt-6 text-lg leading-8 text-cream/75">{post.excerpt}</p>
              <div className="mt-8 space-y-5 leading-8 text-cream/72">
                <p>
                  Start with the event date, guest count, preferred location and total budget. These four details decide
                  the right garden size, catering estimate, decor scale and vendor schedule.
                </p>
                <p>
                  Always compare parking, rooms, backup power, cancellation policy, decoration permissions and payment
                  milestones before final booking.
                </p>
                <p>
                  For a faster quote, send your date and guest count on WhatsApp. The team can then recommend Silver,
                  Gold, Platinum or a custom package.
                </p>
              </div>
            </article>
            <InquiryForm compact />
          </div>
        </section>
      </main>
      <FloatingCTA />
    </>
  );
}
