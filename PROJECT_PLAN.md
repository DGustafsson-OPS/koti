# Koti — Project Plan

**Koti** (Finnish for "home") is a web app that turns your home into a searchable, room-by-room digital record of every material, item, warranty, task, repair, cost, and maintenance event.

## Vision

> A permanent memory for your home — every room, repair, material, warranty, and task connected.

## Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | Next.js 15 (App Router) | Full-stack React, SSR, API routes |
| Language | TypeScript | Type safety across DB and UI |
| Database | SQLite + Drizzle ORM | Zero-config local dev; easy Postgres migration later |
| Styling | Tailwind CSS | Fast, consistent UI |
| Auth | Deferred (Phase 2) | Single-user local MVP first |

## Phases

### Phase 1 — MVP Foundation (current)

**Goal:** Prove the "home memory" concept with a working local app.

| # | Feature | Status |
|---|---|---|
| 1 | Property + room structure | In progress |
| 2 | Room notes, paint, materials, photos | In progress |
| 3 | Inventory / assets | In progress |
| 4 | Maintenance tasks + reminders | In progress |
| 5 | Task completion → history | In progress |
| 6 | Cross-linking via entity_links | In progress |
| 7 | Universal search | In progress |
| 8 | Dashboard | In progress |

**MVP screens:**

- Home dashboard (overdue tasks, upcoming, expiring warranties, recent history)
- Property list + detail
- Room page (memory card: materials, inventory, tasks, history, notes)
- Asset page
- Task list + completion flow
- Search page

### Phase 2 — Polish & Multi-User

- User authentication (Clerk or Auth.js)
- Property members / family sharing
- Document upload + file storage
- Photo gallery per room/asset
- PWA / mobile-friendly capture
- Data export (PDF, CSV, JSON, ZIP)

### Phase 3 — Intelligence & Pro

- AI receipt extraction
- AI natural-language search ("What paint did we use in the bedroom?")
- Insurance inventory reports
- Home sale packet generator
- Pro plan: handover packets, branded reports, multi-property dashboard

## Build Order

```
Week 1-2   Schema + property/room CRUD + dashboard shell
Week 3     Inventory/assets + materials library
Week 4     Tasks + recurrence + completion → history
Week 5     Entity links + universal search
Week 6     Polish UI, seed data, export basics
```

## Success Criteria (MVP)

- [ ] Create a property with 5+ rooms in under 2 minutes
- [ ] Record paint color on a room and find it via search
- [ ] Add an asset with warranty date; see it on dashboard when expiring
- [ ] Create a recurring task, complete it, see it in history
- [ ] Dashboard shows overdue/upcoming tasks at a glance

## Repository Structure

```
koti/
├── docs/
│   └── DATA_MODEL.md          # Refined schema reference
├── drizzle/                   # SQL migrations
├── src/
│   ├── app/
│   │   ├── page.tsx             # Dashboard
│   │   ├── properties/        # Property CRUD
│   │   ├── rooms/             # Room pages
│   │   ├── assets/            # Asset pages
│   │   ├── tasks/             # Task management
│   │   ├── history/           # Maintenance timeline
│   │   └── search/            # Universal search
│   ├── components/            # Shared UI
│   ├── db/
│   │   ├── schema.ts          # Drizzle schema
│   │   └── index.ts           # DB client
│   └── lib/                   # Queries, utils, types
├── property_maintenance_web_app_idea.md
└── PROJECT_PLAN.md
```

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Scope creep | Strict MVP feature list; defer AI and reports |
| Over-engineered linking | Start with direct FKs; entity_links for extras |
| SQLite limits in production | Drizzle abstracts DB; migrate to Postgres when needed |
| No auth in MVP | Single default user; schema ready for multi-user |

## Next Steps After MVP

1. User testing with 3–5 homeowners
2. Add auth + family sharing
3. Document/photo upload with S3 or local storage
4. Recurring task engine (cron or client-side calculation)
5. First report: room specification sheet (PDF)
