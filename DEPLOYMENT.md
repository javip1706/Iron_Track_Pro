# Iron Track Pro - Netlify Deployment Guide

## Prerequisites

Before deploying to Netlify, you need:
1. A GitHub account with this repository
2. A Netlify account (free tier is sufficient)
3. A Supabase project with the required tables set up

## Step 1: Set Up Supabase Tables

Create the following tables in your Supabase project:

### routines table
- `id` (text, primary key)
- `name` (text)
- `days` (jsonb)
- `created_at` (timestamp)

### exercises table
- `id` (text, primary key)
- `muscle_group` (text)
- `name` (text)
- `variants` (jsonb)

### body_stats table
- `id` (text, primary key)
- `date` (bigint)
- `weight` (numeric)
- `body_fat` (numeric)
- `waist` (numeric)
- `chest` (numeric)
- `arm` (numeric)

### workout_logs table
- `id` (text, primary key)
- `routine_id` (text)
- `routine_name` (text)
- `day_id` (text)
- `day_name` (text)
- `date` (bigint)
- `week_id` (text)
- `exercises` (jsonb)

## Step 2: Get Your Supabase Credentials

1. Go to https://app.supabase.com/
2. Select your project
3. Go to **Project Settings** > **API**
4. Copy:
   - **Project URL** (e.g., `https://your-project.supabase.co`)
   - **Anon Key** (the public anonymous key)

## Step 3: Connect to Netlify

1. Go to https://app.netlify.com/
2. Click **Add new site** > **Import an existing project**
3. Select **GitHub** and authorize Netlify
4. Select this repository (`Iron_Track_Pro`)
5. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - Click **Deploy site**

## Step 4: Set Environment Variables

After deployment starts, Netlify will build and fail (because env vars are missing). That's expected!

1. Go to your Netlify site dashboard
2. Click **Site settings** > **Build & deploy** > **Environment**
3. Click **Edit variables**
4. Add these two variables:
   - **VITE_SUPABASE_URL:** (your Supabase URL from Step 2)
   - **VITE_SUPABASE_ANON_KEY:** (your Supabase anon key from Step 2)
5. Click **Save**

## Step 5: Trigger a New Deploy

1. Go to **Deploys** tab
2. Click **Trigger deploy** > **Deploy site**
3. Netlify will rebuild with your environment variables
4. Once build completes, your site is live!

## Troubleshooting

### Build fails with "Missing Supabase credentials"
- Make sure environment variables are set in Netlify Site Settings
- They are case-sensitive, use exactly: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

### Database errors on first load
- Make sure all tables exist in Supabase (see Step 1)
- Check that your Supabase project has proper RLS policies (should allow anon access for testing)

### localStorage not persisting
- This is expected - browser localStorage persists only during a single session
- All data is being saved to Supabase automatically

## Local Development

To test locally before deploying:

1. Copy `.env.example` to `.env.local`
2. Fill in your Supabase credentials
3. Run `npm run dev`
4. Visit `http://localhost:5173`

## Security Notes

- Your Supabase anon key is public (it's meant to be)
- Use Supabase RLS (Row Level Security) policies to protect sensitive data
- The API key in your frontend is intentionally the anonymous key with limited permissions
- Never commit `.env.local` - it's in `.gitignore`
