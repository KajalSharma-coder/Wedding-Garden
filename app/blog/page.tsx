import Link from "next/link";
import { FloatingCTA } from "@/components/floating-cta";
import { Nav } from "@/components/nav";
import { SectionHeading } from "@/components/ui";
import { blogPosts } from "@/lib/data";

export const metadata = {
  title: "Wedding Blog",
  description: "Wedding tips, decoration ideas, bridal trends and budget planning guides."
};

export default function BlogPage() {
  return (
    <>
      <Nav />
      <main className="min-h-screen bg-ink pt-28">
        <section className="section">
          <div className="container">
            <SectionHeading eyebrow="Blog SEO" title="Wedding tips, decoration ideas and budget planning" />
            <div className="grid gap-4 md:grid-cols-2">
              {blogPosts.map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="glass rounded-[8px] p-6">
                  <p className="text-sm font-bold text-gold">{post.category}</p>
                  <h1 className="mt-3 font-display text-3xl leading-tight">{post.title}</h1>
                  <p className="mt-4 leading-7 text-cream/70">{post.excerpt}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <FloatingCTA />
    </>
  );
}
