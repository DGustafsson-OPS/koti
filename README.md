# Koti

A web app that turns your home into a searchable, room-by-room digital record of every material, item, warranty, task, repair, cost, and maintenance event.

> Never lose a detail about your home again.

## Quick start

```bash
npm install
npm run db:push
npm run db:seed    # optional demo data
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Docs

- [Project Plan](./PROJECT_PLAN.md) — phases, milestones, build order
- [Data Model](./docs/DATA_MODEL.md) — refined schema reference
- [Product Concept](./property_maintenance_web_app_idea.md) — original idea doc

## MVP Features

- Property + room structure
- Materials library with room linking
- Inventory / assets with warranties
- Maintenance tasks (one-time & recurring)
- Task completion → history timeline
- Entity cross-linking
- Universal search
- Dashboard (overdue, upcoming, expiring warranties)

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run db:push` | Push schema to SQLite |
| `npm run db:seed` | Load demo data |
| `npm run db:studio` | Open Drizzle Studio |

## Stack

Next.js 15 · TypeScript · SQLite · Drizzle ORM · Tailwind CSS
