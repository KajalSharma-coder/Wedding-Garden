import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-gold">{children}</p>;
}

export function SectionHeading({
  eyebrow,
  title,
  text
}: {
  eyebrow: string;
  title: string;
  text?: string;
}) {
  return (
    <div className="mx-auto mb-12 max-w-3xl text-center">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="font-display text-3xl leading-tight text-current sm:text-4xl md:text-6xl">{title}</h2>
      {text ? <p className="mt-5 text-base leading-8 text-current/70 md:text-lg">{text}</p> : null}
    </div>
  );
}

export function PrimaryButton({
  href,
  children,
  className = ""
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`focus-ring inline-flex items-center justify-center gap-2 rounded-full bg-gold px-5 py-3 text-center text-sm font-bold text-ink shadow-glow transition hover:-translate-y-0.5 hover:bg-cream sm:px-6 ${className}`}
    >
      {children}
      <ArrowRight size={18} />
    </Link>
  );
}

export function GhostButton({
  href,
  children,
  className = ""
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`focus-ring inline-flex items-center justify-center gap-2 rounded-full border border-cream/25 px-5 py-3 text-center text-sm font-bold text-ivory transition hover:border-gold hover:bg-white/10 sm:px-6 ${className}`}
    >
      {children}
    </Link>
  );
}

export function CallButton() {
  return (
    <a
      className="focus-ring inline-flex items-center justify-center gap-2 rounded-full bg-ivory px-5 py-3 text-center text-sm font-bold text-maroon transition hover:bg-gold sm:px-6"
      href="tel:+919876543210"
    >
      <Phone size={18} />
      Call Now
    </a>
  );
}
