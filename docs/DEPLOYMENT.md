# SCSCO College Digital Platform — Deployment Manual

## 1. Prerequisites
- Node.js 18.x or 20.x LTS
- PostgreSQL database instance (Supabase, Neon, or local PostgreSQL)
- Vercel or cloud container host

---

## 2. Environment Variables (.env)

Create a `.env` file based on `.env.example`:

```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres?sslmode=require"
AUTH_SECRET="your-32-byte-hex-random-session-secret"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

---

## 3. Database Migration with Supabase

1. Connect to your Supabase project dashboard.
2. Retrieve the pooled connection URL for `DATABASE_URL` and direct connection URL for `DIRECT_URL`.
3. Run the Prisma migrations:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init_college_platform
   ```
4. Populate initial academic records:
   ```bash
   npm run seed
   ```

---

## 4. Vercel Deployment

1. Push your repository to GitHub.
2. Link the project on the Vercel Dashboard.
3. Configure Environment Variables (`DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`).
4. Set Build Command:
   ```bash
   npm run build
   ```
5. Deploy.
