# Cloudflare Workers + Render

Connect `Harperwrites/endowal-frontend`, branch `main`, in Workers & Pages.
Use project name `endowal-frontend` (matching wrangler.jsonc).

- Build command: `npm run build:cloudflare`
- Deploy command: `npm run deploy:cloudflare`
- Preview command: `npx wrangler versions upload`
- Root directory: repository root

Set these under **Build variables and secrets**, before building:

```
NEXT_PUBLIC_API_BASE_URL=https://endowal-api.onrender.com
NEXT_PUBLIC_CLIENT_ID=endowal
NODE_VERSION=22
```

Do not copy backend secrets or DATABASE_URL to Cloudflare.
Once deployed, set Render CORS_ORIGINS to a JSON list containing the exact
frontend HTTPS origin, without a trailing slash. Redeploy the backend.

Verify the landing page, intro video, API client identity check, and login.
The new production database needs users provisioned separately. Remembered
sign-in across workers.dev and onrender.com still needs a same-origin proxy
or matching custom domains; CORS alone does not resolve browser cookie rules.

Local preview: `npm run build:cloudflare && npm run preview:cloudflare`.
