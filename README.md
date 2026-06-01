# Wedding Garden

A luxury wedding garden booking platform crafted for premium venues, celebration services, vendor discovery, event inquiries, and operational management. The project blends a polished customer-facing Next.js experience with an Express and MySQL backend for bookings, vendors, uploads, leads, admin workflows, and service management.

## Experience

Wedding Garden is designed for high-intent event customers who want to explore venues, browse celebration services, view galleries, compare vendor offerings, and submit booking inquiries with confidence. The interface focuses on rich imagery, smooth motion, responsive layouts, and a refined hospitality feel across desktop and mobile.

## Highlights

- Premium homepage for wedding garden discovery, services, galleries, packages, vendors, and inquiry calls to action.
- Venue and garden pages with detailed media, amenities, pricing context, availability-oriented flows, and booking entry points.
- Event pages for wedding, reception, engagement, haldi, mehendi, birthday, anniversary, baby shower, and corporate celebrations.
- Vendor marketplace and vendor dashboard for services, leads, reviews, availability, profile management, and bookings.
- Admin dashboard screens for bookings, gardens, gallery, payments, users, services, reviews, settings, planner leads, and contact inquiries.
- Express API with authentication, uploads, public media serving, bookings, service data, vendor workflows, and admin operations.
- MySQL schema and migrations for venues, vendors, services, bookings, payments, leads, reviews, gallery content, and submission data.
- SEO-ready architecture with metadata, sitemap, robots, landing pages, Open Graph assets, PWA manifest, and service worker support.

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- Express 5
- MySQL
- JWT authentication
- Multer uploads
- Razorpay, WhatsApp, GA, Meta Pixel, PhonePe, Paytm, and Cloudinary-ready configuration

## Project Structure

```text
app/          Next.js app router pages and route-level UI
components/   Reusable customer, vendor, admin, and booking components
lib/          Shared client utilities, data helpers, and API clients
server/src/   Express API, database, auth, uploads, and HTTP helpers
database/     SQL schema, migrations, and seed/submission data
public/       Static assets, admin static files, manifest, icons, and media
uploads/      Local uploaded gallery, vendor, service, and document media
css/          Additional stylesheet assets
js/           Additional browser script assets
```

## Getting Started

Install dependencies:

```bash
npm install
```

Create your local environment file:

```bash
cp .env.example .env
```

Import the database schema:

```bash
mysql -u root -p < database/schema.sql
```

Run the complete development stack:

```bash
npm run dev
```

Frontend:

```text
http://localhost:3000
```

API health check:

```text
http://localhost:4000/health
```

## Available Scripts

```bash
npm run dev          # Run Next.js and Express together
npm run dev:web      # Run only the Next.js frontend
npm run dev:api      # Run only the Express API
npm run build        # Build the frontend
npm run start        # Start the production frontend server
npm run api:start    # Start the API server
npm run api:build    # Type-check the API/server project
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript checks
```

## Environment

Copy `.env.example` to `.env` and update values for your local or production system:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_API_BASE`
- `WEB_ORIGIN`
- `API_PORT`
- `JWT_SECRET`
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
- `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_TOKEN`
- `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_META_PIXEL_ID`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- PhonePe and Paytm merchant credentials when those payment methods are enabled

## Deployment Notes

1. Configure production environment variables.
2. Import `database/schema.sql` into a managed MySQL instance or VPS-hosted MySQL.
3. Build the frontend with `npm run build`.
4. Run the Next.js app on port `3000` or your chosen platform runtime.
5. Run the Express API on `API_PORT`, commonly `4000`.
6. Serve the app and API behind HTTPS with your hosting provider, reverse proxy, or load balancer.
7. Point `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_API_BASE` to production URLs.

## Vision

Wedding Garden is built to grow from a single premium booking experience into a complete celebration commerce platform: multi-venue discovery, vendor subscriptions, staff assignment, lead management, media-rich galleries, payment automation, local SEO pages, and future customer/vendor mobile apps.
