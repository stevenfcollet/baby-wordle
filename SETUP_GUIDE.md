# Baby Wordle — Setup Guide
## No coding required. Follow each step in order.

---

## Step 1 — Put the code on GitHub

1. Go to https://github.com and create a free account if you don't have one.
2. Click the **+** button (top right) → **New repository**.
3. Name it `baby-wordle`, set it to **Private**, click **Create repository**.
4. On the next page, click **uploading an existing file**.
5. Drag and drop ALL the files and folders from this project into the upload area.
6. Click **Commit changes**.

---

## Step 2 — Set up Supabase (your database)

1. Go to https://supabase.com and create a free account.
2. Click **New project**, give it a name like `baby-wordle`, set a database password (save it somewhere), choose a region close to you.
3. Wait ~2 minutes for it to set up.
4. In the left menu click **SQL Editor** → **New query**.
5. Open the file `supabase/setup.sql` from this project, copy everything, paste it in, click **Run**.
6. Go to **Project Settings** (gear icon) → **API**.
7. Copy these three values — you'll need them in Step 4:
   - **Project URL** (looks like `https://xxxx.supabase.co`)
   - **anon public** key (long string under "Project API keys")
   - **service_role** key (click "Reveal" to see it — keep this secret!)

---

## Step 3 — Set up Resend (email sending)

1. Go to https://resend.com and create a free account.
2. Go to **API Keys** → **Create API Key**, name it `baby-wordle`, click Create.
3. Copy the API key (it starts with `re_`). You only see it once!
4. For the "from" email address: Resend's free plan lets you send from
   `onboarding@resend.dev` to start. You can use that while testing.
   Later you can add your own domain in Resend → Domains.

---

## Step 4 — Deploy to Vercel

1. Go to https://vercel.com and create a free account (sign in with GitHub).
2. Click **Add New** → **Project**.
3. Find your `baby-wordle` GitHub repo and click **Import**.
4. Before clicking Deploy, click **Environment Variables** and add these one by one:

   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
   | `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service_role key |
   | `RESEND_API_KEY` | Your Resend API key |
   | `EMAIL_FROM` | `onboarding@resend.dev` (or your domain later) |
   | `ADMIN_PASSWORD` | A password only you know (e.g. `babyname2025!`) |
   | `CRON_SECRET` | Any random string (e.g. `myrandomsecret123`) |
   | `NEXT_PUBLIC_SITE_URL` | Leave blank for now — fill in after deploy |

5. Click **Deploy**. Wait ~1 minute.
6. You'll get a URL like `baby-wordle-abc123.vercel.app`. Copy it.
7. Go back to Vercel → your project → **Settings** → **Environment Variables**.
8. Add `NEXT_PUBLIC_SITE_URL` = your new Vercel URL (e.g. `https://baby-wordle-abc123.vercel.app`).
9. Go to **Deployments** and click **Redeploy** so the URL takes effect.

---

## Step 5 — Set the baby's name

1. Go to `https://your-vercel-url.vercel.app/admin`.
2. Enter your admin password.
3. Type the baby's name and click **Save name**.
4. That's it — the game is live!

---

## Step 6 — Share the link

Share `https://your-vercel-url.vercel.app` with family and friends.
They sign up themselves and can start guessing right away.

---

## When the baby is born

1. Go to `/admin`, sign in.
2. Click **Baby is born! Reveal name**.
3. Everyone gets an announcement email with the baby's name.
4. Done — congratulations!

---

## How daily reminders work

Vercel automatically runs a reminder email every day at 9:00 AM (UTC).
Players who haven't guessed yet will get an email nudging them to play.
Players who have already guessed (or won) are skipped automatically.

---

## Questions?

- The game link: `https://your-vercel-url.vercel.app`
- The admin panel: `https://your-vercel-url.vercel.app/admin`
- Emails are sent from Resend — check their dashboard if emails aren't arriving.
- Player list is in Supabase → Table Editor → players.
