# Royal Vivah Gardens

Production-ready luxury wedding garden and event booking project built with Next.js 15, React, TypeScript, Tailwind CSS, Framer Motion, Node/Express and MySQL.

## Included

- Cinematic premium homepage with video hero, venue cards, services, packages, gallery, vendors, CRM preview and sticky CTAs.
- Venue detail pages with pricing, capacity, media, amenities, availability calendar and booking form.
- Event landing pages for wedding, reception, engagement, haldi, mehendi, birthday, corporate, anniversary and baby shower.
- Admin dashboard with bookings, venues, services, packages, gallery, vendors, leads CRM, payments, coupons, reviews, settings and analytics modules.
- Express API for OTP/JWT auth, bookings, real-time availability, leads CRM, vendors, payments, WhatsApp automation and AI quote endpoints.
- MySQL database schema with venues, packages, bookings, payments, leads, vendors, services, gallery and automation logs.
- SEO architecture with dynamic metadata, sitemap, robots, FAQ schema and high-intent landing pages.
- PWA manifest and service worker for installable/offline-ready app experience.

## Setup

```bash
npm install
cp .env.example .env
mysql -u root -p < database/schema.sql
npm run dev
```

Frontend: `http://localhost:3000`

API: `http://localhost:4000/health`

## Integrations

Add live credentials in `.env`:

- `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`
- `WHATSAPP_PHONE_NUMBER_ID` and `WHATSAPP_TOKEN`
- `NEXT_PUBLIC_GA_ID` and `NEXT_PUBLIC_META_PIXEL_ID`
- `CLOUDINARY_*`
- PhonePe and Paytm merchant values when enabling those payment services

## Deployment

1. Build frontend: `npm run build`
2. Build API: `npm run api:build`
3. Run Next.js behind Nginx on port `3000`.
4. Run Express API with PM2 on port `4000`.
5. Point MySQL credentials to managed MySQL or VPS MySQL.
6. Configure SSL at Nginx or cloud load balancer.
7. Set `NEXT_PUBLIC_SITE_URL` to the production domain.

## Scaling Notes

The schema and routes are structured for multi-venue expansion, vendor subscriptions, staff assignment, franchise branches, multi-city SEO pages and future mobile apps for customers and vendors.
