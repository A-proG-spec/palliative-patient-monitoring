# Palliative Patient Monitoring System — Frontend

React 18 + TypeScript + Vite frontend for the Y12HMC Palliative Care Management Platform.

## Quick Start

```bash
npm install
npm run dev          # http://localhost:5173
```

## Demo Login

| Role  | Email                  | Password    |
|-------|------------------------|-------------|
| Staff | john@gmail.com         | abcdefghi   |
| Admin | admin@example.com      | admin123    |

## Mock Mode

`VITE_USE_MOCK=true` (default) — all API calls return fixture data.  
Set `VITE_USE_MOCK=false` and point `VITE_API_URL` at the real backend to switch.

## Stack

- React 18, TypeScript, Vite
- Tailwind CSS (design tokens from `tailwind.config.js`)
- React Router v6 (RBAC guards)
- TanStack Query v5 (server state)
- Zustand (auth state, persisted)
- React Hook Form + Zod (all forms)
- Recharts (KPS/PPS graphs, admin reports)
- framer-motion (page transitions)
- lucide-react (icons)

## Project Structure

See `docs/folder-structure/frontend-structure.md` for the canonical structure.

## Routes

| Path | Role | Description |
|------|------|-------------|
| `/` | Public | Landing page |
| `/login` | Public | Login |
| `/register` | Public | Staff registration |
| `/admin` | Admin | Dashboard |
| `/admin/patients` | Admin | All patients |
| `/admin/staff` | Admin | Pending staff approvals |
| `/admin/referrals` | Admin | Referral approval |
| `/admin/reports` | Admin | Analytics & export |
| `/dashboard` | Staff | Staff dashboard |
| `/patients` | Staff | Patient list |
| `/patients/:id` | Staff | Patient detail + tabs |
| `/patients/:id/visits` | Staff | Record visit |
| `/patients/:id/medications` | Staff | Order medication |
| `/patients/:id/labs` | Staff | Order lab |
| `/patients/:id/referrals` | Staff | Request referral |
| `/patients/:id/admissions` | Staff | Record admission |
| `/patients/:id/progress` | Staff | KPS/PPS chart |
| `/patients/:id/summary` | Staff | Full summary |
