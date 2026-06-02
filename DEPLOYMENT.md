# Deployment Guide

This project is split into two production services:

- Frontend: Render web service or Vercel, connected to GitHub
- Backend API: Render, connected to GitHub using `render.yaml`
- Database: external MySQL provider such as Railway, Aiven, PlanetScale, DigitalOcean, or a VPS MySQL instance

## Render Frontend

1. Open Render and create a new Blueprint.
2. Connect the GitHub repository: `KajalSharma-coder/Wedding-Garden`.
3. Render will detect `render.yaml` and create `wedding-garden-web`.
4. Confirm the frontend service uses these commands:

```text
Build command: npm ci && npm run build
Start command: npm start
```

5. Add frontend environment variables:

```text
NEXT_PUBLIC_SITE_URL=https://your-render-frontend.onrender.com
NEXT_PUBLIC_API_BASE=https://your-render-api.onrender.com/api
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
NEXT_PUBLIC_GA_ID=
NEXT_PUBLIC_META_PIXEL_ID=
```

`npm start` runs `next start`, which requires a production build in `.next`. Render must run the build command before starting the service.

## Render Backend

1. Open Render and create a new Blueprint.
2. Connect the GitHub repository: `KajalSharma-coder/Wedding-Garden`.
3. Render will detect `render.yaml` and create `wedding-garden-api`.
4. Add the required secret environment variables:

```text
WEB_ORIGIN=https://your-vercel-domain.vercel.app
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=strong-password
DB_HOST=your-mysql-host
DB_PORT=3306
DB_USER=your-mysql-user
DB_PASSWORD=your-mysql-password
DB_NAME=booking
```

5. Import `database/schema.sql` into the MySQL database.
6. Deploy the service.
7. Confirm health check:

```text
https://your-render-service.onrender.com/health
```

## Vercel Frontend

1. Open Vercel and import the GitHub repository: `KajalSharma-coder/Wedding-Garden`.
2. Vercel will detect Next.js and use `vercel.json`.
3. Add frontend environment variables:

```text
NEXT_PUBLIC_SITE_URL=https://your-vercel-domain.vercel.app
NEXT_PUBLIC_API_BASE=https://your-render-service.onrender.com/api
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
NEXT_PUBLIC_GA_ID=
NEXT_PUBLIC_META_PIXEL_ID=
```

4. Deploy.
5. After Vercel gives the final domain, update Render `WEB_ORIGIN` to the same Vercel URL.

## Notes

- Render does not provide managed MySQL, so the API needs an external MySQL connection.
- Uploaded files are stored on the Render persistent disk mounted at `uploads`.
- GitHub pushes to `main` will auto-deploy after both services are connected.
