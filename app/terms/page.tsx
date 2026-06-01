import { Nav } from "@/components/nav";

export const metadata = {
  title: "Terms and Conditions",
  description: "Booking, payment, cancellation and vendor marketplace terms for Royal Vivah Gardens."
};

export default function TermsPage() {
  return (
    <>
      <Nav />
      <main className="min-h-screen bg-ink pt-32">
        <section className="container max-w-3xl py-16">
          <p className="text-sm font-bold uppercase tracking-[0.26em] text-gold">Legal</p>
          <h1 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">Terms and Conditions</h1>
          <div className="mt-8 space-y-5 leading-8 text-cream/72">
            <p>Bookings are confirmed only after date availability, package selection and advance payment confirmation.</p>
            <p>Vendor services, decor, catering, music, permissions and extra charges may vary by event date and package.</p>
            <p>Cancellation, refund and rescheduling requests are handled by the venue office according to the final invoice.</p>
            <p>Payment links are processed through UPI, Razorpay, PhonePe, Paytm or other approved payment partners.</p>
          </div>
        </section>
      </main>
    </>
  );
}
