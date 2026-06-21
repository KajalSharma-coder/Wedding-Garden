# Deployment Guide

This project is split into two production services:

- Frontend: Vercel, connected to GitHub
- Backend API: Render, connected to GitHub using `render.yaml`
- Database: external MySQL provider such as Railway, Aiven, PlanetScale, DigitalOcean, or a VPS MySQL instance

## Render Backend

1. Open Render and create a new Blueprint.
2. Connect the GitHub repository: `KajalSharma-coder/Wedding-Garden`.
3. Render will detect `render.yaml` and create `wedding-garden-api`.
4. Add the required secret environment variables. `WEB_ORIGIN` accepts a comma-separated list and must not include trailing slashes:

```text
WEB_ORIGIN=https://your-vercel-domain.vercel.app,https://wedding-garden-api.onrender.com
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=replace-with-a-temporary-strong-password
ADMIN_PASSWORD_HASH=$2b$10$replaceWithABcryptHash
JWT_SECRET=replace-with-at-least-32-random-characters
DB_HOST=your-mysql-host.example.com
DB_PORT=3306
DB_USER=your-mysql-user
DB_PASSWORD=your-mysql-password
DB_NAME=booking
```

Use `ADMIN_PASSWORD_HASH` in production when possible. `ADMIN_PASSWORD` can be omitted only after a valid bcrypt hash is configured.

5. Import `database/schema.sql` into the MySQL database.
6. Deploy the service.
7. Confirm health and root routes:

```text
https://your-render-service.onrender.com/health
https://your-render-service.onrender.com/
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

## Verification

```text
curl https://your-render-service.onrender.com/
curl https://your-render-service.onrender.com/api/health
```

In the browser network tab, `POST /api/admin/login` should target the Render API origin and return `200` for valid credentials. The response must include `Set-Cookie: rvg_token=...; HttpOnly; Secure; SameSite=None`.

## Notes

- Render does not provide managed MySQL, so the API needs an external MySQL connection.
- Uploaded files are stored on the Render persistent disk mounted at `uploads`.
- GitHub pushes to `main` will auto-deploy after both services are connected.
