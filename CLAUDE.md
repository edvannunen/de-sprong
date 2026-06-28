## Project Configuration

- **Language**: TypeScript
- **Package Manager**: npm
- **Add-ons**: prettier, eslint

---

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## This Directory

This Dropbox folder is the planning workspace for **De Sprong**. The actual SvelteKit code lives at `github.com/edvannunen/de-sprong`. Key files here:

- [Specs/CLAUDE.md](Specs/CLAUDE.md) — complete project spec (data model, screens, design, build order)
- [Specs/Added Specs.md](Specs/Added%20Specs.md) — incremental spec updates (June 2026)
- [Specs/Steps taken.md](Specs/Steps%20taken.md) — build progress log
- [img/](img/) — design assets already mirrored in the GitHub repo

## Project

**De Sprong** (*O, Romantiek Der Hazen*) is a SvelteKit web app for managing jazz music practice material — a list of pieces (songs or exercises), each with study sources that can include YouTube/Spotify embeds and file attachments. Single-user, no authentication in v1.

## Tech Stack

- **SvelteKit** — frontend + server routes, TypeScript
- **SQLite + Drizzle ORM** — one local `.db` file, typed queries, migrations via Drizzle Kit
- **Tailwind CSS + DaisyUI** — jazz aesthetic: warm amber/gold on white, mobile-first (iPad primary)
- **svelte-dnd-action** — drag-and-drop for source ordering (works on touch + desktop)
- **Vitest** (unit) + **Playwright** (e2e)

## Commands

```bash
npm run dev          # Dev server → http://localhost:5173
npm run build        # Production build
npm run preview      # Preview production build
npm run test         # Vitest unit tests
npm run test:e2e     # Playwright e2e tests
npm run db:migrate   # Run Drizzle migrations
npm run db:seed      # Seed DB (creates "Songs" and "Exercises" categories)
```

## Architecture

SvelteKit filesystem routing — all mutations go through form actions in `+page.server.ts` files; no separate REST API.

```
src/
  routes/
    +page.svelte          # Main page: tabbed piece list with inline edit
    +page.server.ts       # Load + CRUD actions for pieces
    piece/[id]/
      +page.svelte        # Detail page: view/edit piece + sources (drag-to-reorder)
      +page.server.ts     # Load + CRUD actions for sources + file uploads
  lib/
    constants.ts          # KEY_OPTIONS — the 24 key values (major + minor); import here, nowhere else
    linkDetector.ts       # Converts YouTube/Spotify URLs to embed iframes
    linkDetector.test.ts  # Vitest unit tests for link detection
    server/
      db.ts               # Drizzle database client + query helpers
uploads/                  # Server-side file storage for attachments
```

### Data Model

Three tables with cascading deletes: `category` → `piece` → `source`.

| Table | Key fields |
|---|---|
| `category` | id, name, order |
| `piece` | id, category_id, name, info, key, top_priority (bool), created_at, updated_at |
| `source` | id, piece_id, name, info, key, link, attachment_path/type/filename, order, created_at, updated_at |

`KEY_OPTIONS` in `src/lib/constants.ts`: `C Db D Eb E F Gb G Ab A Bb B` then `Cm … Bm` — hardcoded, never changes.

Deleting a source also deletes its file from `uploads/`. Deleting a piece cascades to all its sources.

### Link Detection (`src/lib/linkDetector.ts`)

- `youtube.com/watch?v=ID` or `youtu.be/ID` → `<iframe>` embed
- `open.spotify.com/track/ID` → compact `<iframe>` (80px tall)
- Other URL → clickable `<a>` link
- Empty → render nothing

### File Attachments

Images display as clickable thumbnails (open full file in new tab). PDFs display as a filename link (opens in new tab). The server path goes in `attachment_path`, original filename in `attachment_filename`.

### UI Conventions

- Piece list: three columns — Name (80–90% width) | Key (≤3 chars) | Actions
- ♩ for `top_priority` pieces, ♫ for regular; top-priority rows sort first, then alphabetically
- Inline edit on main page; full edit mode on source detail page (Edit/Save/Cancel at bottom)
- Always show a confirmation dialog before any delete

## Code Conventions

- All code, comments, and documentation in **English** (app name "De Sprong" and subtitle "O, Romantiek Der Hazen" stay Dutch)
- Prioritise readable + explicit over compact/clever — the developer is learning the framework
- Write extensive comments explaining *why*, not just *what*
- Every route/component gets a short purpose description at the top of the file

## Design Assets (in `img/`, already in the GitHub repo)

| File | Used on |
|---|---|
| `img/banner_piece.png` | Top of main (piece list) page |
| `img/banner_source.png` | Top of source detail page |
| `img/footer.png` | Footer on all pages |
| `img/favicon.ico` | Browser tab icon |

## Build Status (as of 28 June 2026)

Done: SvelteKit scaffold, Tailwind + DaisyUI, Drizzle + SQLite schema + seed, main page (tabs/list/inline edit), detail page (view/edit/sources), link detection + embeds, drag-and-drop source order.

Remaining for v1: file attachment upload/display/delete · Playwright e2e test suite · design polish.
