# Supabase setup (cloud storage + authentication)

Thesis Forge uses Supabase for two things: a Postgres database that stores
your theses in the cloud, and the authentication system that lets you sign
in across devices. Both are on the free tier.

Total time: about 5 minutes.

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign up (GitHub login works).
2. Click **New project**.
3. Pick any organisation, name the project (e.g. `thesis-forge`), and set a
   strong database password (you can forget it — we won't need it in the app).
4. Choose the region closest to you (Frankfurt / London for Israel).
5. Click **Create new project** and wait for the green dot.

## 2. Copy the API keys

In the Supabase dashboard, go to **Project Settings → API** and copy:

- `Project URL` → this becomes `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` key → this becomes `NEXT_PUBLIC_SUPABASE_ANON_KEY`

> The `anon` key is safe to expose in the browser. Never use the
> `service_role` key in Thesis Forge — row-level security is enforced with
> the anon key only.

## 3. Run the schema

In the Supabase dashboard, open **SQL Editor → New query**, paste the
contents of [`supabase/schema.sql`](./supabase/schema.sql), and click **Run**.

This creates one table (`public.theses`) with row-level security policies
that ensure every user can only see, edit, and delete their own theses.

## 4. Add the env vars to Vercel

In the Vercel dashboard:

1. Open your project.
2. **Settings → Environment Variables**.
3. Add two variables, available to all environments (Production, Preview,
   Development):

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<the anon key from step 2>
   ```

4. **Deployments → Redeploy** (three dots on the latest deployment).

## 5. Configure the redirect URLs (important for magic links)

In Supabase, go to **Authentication → URL Configuration**.

- **Site URL**: your main Vercel URL, e.g. `https://thesis-forge.vercel.app`
- **Redirect URLs** (add both):
  - `https://thesis-forge.vercel.app/auth/callback`
  - `http://localhost:3000/auth/callback` *(for local dev)*

Replace `thesis-forge.vercel.app` with your actual Vercel domain.

## 6. Test

1. Open your deployed site.
2. Click **Sign in** in the top-right.
3. Enter your email → you'll get a magic link in your inbox.
4. Click the link → you're signed in.
5. Create a new thesis → open it in a different browser → it should be there.

## Importing your existing local theses

If you already have theses saved locally (from before the cloud upgrade),
the dashboard will show a blue banner offering to **Upload to cloud**.
Click it once and they'll be synced.

## Optional: password-based sign-in

By default the login page supports both magic links and email + password.
If you use email + password, Supabase will send a confirmation email. If
you want to skip the confirmation step (not recommended in production), go
to **Authentication → Providers → Email** and toggle off "Confirm email".

## Turning off cloud storage temporarily

If you remove the two `NEXT_PUBLIC_SUPABASE_*` environment variables and
redeploy, the app falls back to local IndexedDB storage (per-browser, same
behaviour as before). This is useful for local development without a
Supabase project, but not recommended for production.
