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