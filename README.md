# FundiConnect 🇰🇪

Hyper-local service marketplace connecting households, businesses and property managers with skilled Kenyan artisans.

## Stack
- Next.js / React / TypeScript / Tailwind CSS
- Leaflet-ready map layer
- Java 17 / Spring Boot 3 REST API
- PostgreSQL + PostGIS
- Spring Security-ready authentication boundary

## MVP
Discover nearby artisans, filter by trade and availability, view verification/rating/price signals, post or directly dispatch jobs, and track jobs through Pending → Accepted → In Progress → Completed → Closed.

## Run
Frontend: `cd frontend && npm install && npm run dev`
Backend: `cd backend && mvn spring-boot:run`

The first frontend iteration uses demo data while the API and PostGIS foundation are being wired in.

## Frontend data setup (required)

The deployed Next.js frontend uses Supabase Auth, the `public.users` profile table, the `public_artisan_directory` view, and Supabase Storage. The original `database/001_initial.sql` defines the separate PostGIS/backend prototype tables; it does **not** create the objects used by the current frontend.

Before testing registration, profile editing, or Discover:

1. Open the Supabase project connected to Render.
2. Open **SQL Editor** and run `database/002_supabase_profiles.sql` from this repository.
3. In Supabase **Authentication → URL Configuration**, set the Site URL to the deployed Render URL and add that URL to the allowed redirect URLs.
4. Confirm Render has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` set, then deploy the latest commit.

The migration creates profile rows for new and existing Auth users, the public artisan directory view, and the avatar bucket with per-user upload policies. Do not expose the Supabase service-role key in frontend environment variables.
