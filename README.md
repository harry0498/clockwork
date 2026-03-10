# Clockwork

Freelance time tracking and invoicing app built for UK-based freelancers. Track billable hours, manage clients, generate invoices with PDF export, and customise invoice templates — all from one place.

## Features

- **Time tracking** — log billable hours with per-client hourly rates
- **Client management** — store client details, contact info, and VAT numbers
- **Invoicing** — create, send, and track invoices (draft → sent → paid)
- **PDF export** — generate professional PDF invoices from customisable templates
- **Invoice templates** — personalise layout and include your banking details
- **Dashboard** — overview of recent activity and invoice status
- **Dark mode** — system-aware theme toggle

## Tech stack

- [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- [React 19](https://react.dev/)
- [PostgreSQL](https://www.postgresql.org/) + [Drizzle ORM](https://orm.drizzle.team/)
- [Tailwind CSS 4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- [NextAuth.js](https://next-auth.js.org/) for authentication
- [@react-pdf/renderer](https://react-pdf.org/) for PDF generation
- [Biome](https://biomejs.dev/) for linting and formatting

## Getting started

### Prerequisites

- [Bun](https://bun.sh/) (v1+)
- PostgreSQL database

### Setup

```bash
# Install dependencies
bun install

# Copy environment variables and fill in your values
cp .env.example .env

# Push database schema
bun db:push

# (Optional) Seed with sample data
bun seed

# Start dev server
bun dev
```

The app runs at [http://localhost:3000](http://localhost:3000) by default.

### Environment variables

See `.env.example` for required variables:

- `DATABASE_URL` — PostgreSQL connection string
- `NEXTAUTH_SECRET` — secret for session encryption
- `NEXTAUTH_URL` — app URL (e.g. `http://localhost:3000`)

## Scripts

| Command | Description |
| --- | --- |
| `bun dev` | Start dev server with Turbopack |
| `bun run build` | Production build |
| `bun start` | Start production server |
| `bun run lint` | Check for lint errors |
| `bun run lint:fix` | Auto-fix lint errors |
| `bun run format` | Format source files |
| `bun db:generate` | Generate Drizzle migrations |
| `bun db:push` | Push schema to database |
| `bun db:studio` | Open Drizzle Studio |
| `bun seed` | Seed database with sample data |
