"use client";

import { CalendarDays, MessageCircle, Phone } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export function FloatingCTA() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 sm:bottom-5 sm:right-5 sm:gap-3"
    >
      <a
        href="https://wa.me/919876543210?text=I%20want%20to%20book%20a%20wedding%20venue"
        className="grid size-12 place-items-center rounded-full bg-[#24d366] text-white shadow-glow sm:size-14"
        aria-label="WhatsApp inquiry"
      >
        <MessageCircle size={24} />
      </a>
      <a href="tel:+919876543210" className="grid size-12 place-items-center rounded-full bg-gold text-ink shadow-glow sm:size-14" aria-label="Call venue">
        <Phone size={23} />
      </a>
      <Link href="/#quick-inquiry" className="grid size-12 place-items-center rounded-full bg-ivory text-maroon shadow-glow sm:size-14" aria-label="Open inquiry form">
        <CalendarDays size={23} />
      </Link>
    </motion.div>
  );
}
