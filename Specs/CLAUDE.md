# De Sprong — CLAUDE.md

## Project

**Name:** De Sprong  
**Subtitle:** O, Romantiek Der Hazen  
*(based on a composition by Misha Mengelberg)*

A web application for managing jazz music practice material for piano (or any other instrument).

---

## Developer

The developer has experience with C#, Java, PHP and JavaScript, but not recently.
The goal is to learn how a modern web application is built — not just the end result,
but also the process and the code itself.

**Therefore, the following rules apply to all code:**
- Write extensive comments in English in all files
- Explain not just *what* the code does, but also *why*, for a reader who is learning the framework
- Always choose the readable solution over the clever/compact one
- When in doubt: more explanation, not less

---

## Tech Stack

### Frontend + Backend
**SvelteKit**  
One framework for both the UI and the server-side API (via SvelteKit server routes).  
Svelte is the most readable modern JavaScript framework and is approachable for someone
with a C#/Java background.

### Database
**SQLite** via **Drizzle ORM**  
- One local `.db` file, no separate database server needed
- Drizzle provides typed queries that are easy to read
- Migrations via Drizzle Kit
- Cascading deletes: when a piece is deleted, all its sources (and their attachments) are deleted too
- For the amount of data involved (dozens of pieces) SQLite is more than sufficient

### Styling
**Tailwind CSS** + **DaisyUI** (component library)  
Jazz look and feel — dark/moody aesthetic with warm accent colours.  
Mobile-first: all layouts are designed for iPad/phone first, then scaled up for desktop.

### Drag-and-drop
**svelte-dnd-action** (lightweight, Svelte-native, works on both desktop and touch/mobile)

### Testing
- **Vitest** — unit tests (data model logic, URL detection, key dropdown values, helper functions)
- **Playwright** — end-to-end tests (main page, detail page, CRUD flows)

### Internet required?
Yes — the app may require an internet connection (for embeds and external hosting later).

---

## Environment

- **Development:** local on Windows 11 laptop (`npm run dev`)
- **Target platforms:** iPad (primary), Android phone, laptop (desktop browser) — mobile-first responsive design
- **Hosting (later):** Dutch or GDPR-compliant provider, simple and affordable
  (e.g. TransIP, Hetzner, or Fly.io)
- **First version:** no authentication, no multi-user

---

## Data Model

### Category (tab on the main page)
```
category
  id          integer  primary key
  name        text     required        -- e.g. "Songs", "Exercises"
  order       integer                  -- for tab ordering in later versions
```
*In the first version there are two fixed categories: "Songs" and "Exercises".
The data model is already set up for dynamic tabs in later versions.*

### Piece (a song or exercise)
```
piece
  id              integer  primary key
  category_id     integer  foreign key → category.id  ON DELETE CASCADE
  name            text     required
  info            text     optional
  key             text     optional     -- selected from fixed dropdown (see Key Values below)
  top_priority    boolean  default false
  created_at      datetime default current_timestamp
  updated_at      datetime default current_timestamp
```

### Source (study material linked to a piece)
```
source
  id                  integer  primary key
  piece_id            integer  foreign key → piece.id  ON DELETE CASCADE
  name                text     required
  info                text     optional
  key                 text     optional    -- always show if filled in; same dropdown as piece
  link                text     optional    -- URL to YouTube, Spotify, or other webpage
  attachment_path     text     optional    -- server path to uploaded file (image or PDF)
  attachment_type     text     optional    -- "image" or "pdf"
  attachment_filename text     optional    -- original filename, shown as label for PDFs
  order               integer             -- display order, adjustable via drag-and-drop
  created_at          datetime default current_timestamp
  updated_at          datetime default current_timestamp
```

### Key values (hardcoded — will never change, a separate table would be overkill)
The key field is always a dropdown with these values, in this order:
```
Major: C, Db, D, Eb, E, F, Gb, G, Ab, A, Bb, B
Minor: Cm, Dbm, Dm, Ebm, Em, Fm, Gbm, Gm, Abm, Am, Bbm, Bm
```
Export this as a constant (e.g. `KEY_OPTIONS`) in a shared `constants.ts` file.

### File storage (attachments)
- Uploaded files are stored in an `uploads/` folder on the server
- Allowed file types: images (jpg, png, gif, webp) and PDF
- The server path is stored in `attachment_path`, the original filename in `attachment_filename`
- When a source is deleted, its associated file is also deleted from the server

### Attachment display (client-side)
- **Image:** show a clickable thumbnail; opens the full file in a new tab
- **PDF:** show the filename as a clickable link; opens the PDF in a new tab
- **No attachment:** show nothing (no empty space)

### Link detection (client-side)
- **YouTube:** `youtube.com/watch?v=ID` or `youtu.be/ID`
  → convert to `https://www.youtube.com/embed/ID` and render as iframe
- **Spotify track:** `open.spotify.com/track/ID`
  → convert to `https://open.spotify.com/embed/track/ID` and render as compact iframe (80px tall)
- **Other URL:** render as a clickable link
- **No URL:** show nothing (no empty space)

---

## Design

The app has a **jazz look and feel** — warm amber/gold accents and a slightly vintage
typographic feel, on a white background. Not sterile or clinical.

- **General background color:** white

### Assets (already in the repository, under `img/`)
- **Piece page banner:** `https://github.com/Edvannunen/de-sprong/blob/main/img/banner_piece.png`  
  → used as top banner on the main (piece list) page
- **Source page banner:** `https://github.com/Edvannunen/de-sprong/blob/main/img/banner_source.png`  
  → used as top banner on the source detail page
- **Footer:** `https://github.com/Edvannunen/de-sprong/blob/main/img/footer.png`  
  → used as footer on all pages
- **Favicon:** `https://github.com/Edvannunen/de-sprong/blob/main/img/favicon.ico`  
  → used as the browser tab icon

### Piece list visual style
- Each piece in the list has a music note icon to the left of the name:
  - **Quarter note (♩)** for top priority pieces
  - **Double eighth note (𝄞 — use ♫)** for regular pieces
- Reference style: Music Sheet Organizer on https://www.notion.com/templates/music-sheet-organizer

---

## Screens

### Main page (`/`) — Piece list

**Layout (mobile-first table):**

Three columns per row:

| Name (≈80–90% width) | Key (small, max 3 chars) | Actions |
|---|---|---|
| ♩/♫ Piece name (clickable → source page) | e.g. Am | Edit / Delete |

- Rows grouped by top priority (top priority pieces shown first), then alphabetically by name
- **View mode per row:** name + key displayed inline
- **Edit mode per row** (triggered by Edit button):
  - Name becomes a text input
  - Key becomes a dropdown (KEY_OPTIONS)
  - Edit and Delete buttons are replaced by Save and Cancel buttons
- **Delete:** always show a confirmation dialog before deleting
- Info (if present) shown below name in a smaller font, max two lines, truncated if longer
- Button above the list to add a new piece (opens detail/edit page for a new piece)

### Source page (`/piece/[id]`)

**Top banner:** Source banner image (see Design > Assets)

**Default mode is view mode.** Edit and Delete buttons at the bottom of the page.
On edit: Save and Cancel buttons replace Edit/Delete. On mobile this is the primary interaction pattern.

**Layout per source (view mode):**
```
Name (bold, larger font)                    Key (right-aligned, same size as Name)
Info (normal font, multiple lines if needed; one line of space if absent)
Link (YouTube/Spotify embed, or clickable URL; one line of space if absent)
Attachment (thumbnail if image; filename link if PDF; one line of space if absent)
```

**Field specs:**
- **Name:** bold, larger font. Text input in edit mode.
- **Key:** right-aligned, same font size as Name. Dropdown (KEY_OPTIONS) in edit mode.
- **Info:** normal font size. Multiple lines rendered as-is. In edit mode: two-line textarea.
- **Link:**
  - View mode: YouTube or Spotify embed rendered inline; other URLs as a clickable link
  - Edit mode: plain text input for the URL
- **Attachment:**
  - View mode: clickable thumbnail (image) or filename link (PDF), both open in new tab
  - Edit mode: file upload input; also show a delete button for existing attachment (with confirmation)

**Source order:** drag-and-drop to reorder sources (svelte-dnd-action, works on touch and desktop)

**Delete source:** always show a confirmation dialog before deleting

---

## Build Order (first version)

1. **Repository setup**
   - Create a GitHub repository named `de-sprong` under `github.com/edvannunen`
   - Use: `gh repo create edvannunen/de-sprong --public --description "De Sprong — jazz practice manager"`
   - Initialise with a `README.md` (see README section below)

2. Set up SvelteKit project (+ Tailwind CSS + DaisyUI + Drizzle + SQLite)

3. Set up testing infrastructure (Vitest + Playwright)

4. Database schema + seed with two categories ("Songs", "Exercises")

5. Main page: tabs + sorted list + add/delete piece (with inline edit)

6. Source page: view and edit piece + add/edit/delete sources

7. Link detection + YouTube/Spotify embeds

8. Attachments: upload, display, delete

9. Drag-and-drop source order

---

## README (for the repository)

The README should include:

- **Project description:** what De Sprong is and what it does
- **Tech stack:** SvelteKit, SQLite, Drizzle ORM, Tailwind CSS, DaisyUI
- **Prerequisites:** Node.js (version 18+), npm
- **Installation:**
  ```bash
  git clone https://github.com/edvannunen/de-sprong.git
  cd de-sprong
  npm install
  ```
- **Database setup:**
  ```bash
  npm run db:migrate
  npm run db:seed
  ```
- **Development:**
  ```bash
  npm run dev
  ```
  Then open `http://localhost:5173` in your browser.
- **Testing:**
  ```bash
  npm run test          # Vitest unit tests
  npm run test:e2e      # Playwright end-to-end tests
  ```
- **Project structure:** brief overview of key folders and files

---

## Later Versions (do not build yet)

- Dynamic tabs: add, delete, rename, reorder
- Search by name or key on the main page
- Authentication and multi-user (each user their own environment)
- PWA (Progressive Web App) — installable on iPad/Android home screen
- Native app (possibly via Capacitor or Tauri)

---

## Conventions

- All variable names, functions and filenames in **English** (standard in code)
- All comments and documentation in **English**
- UI text in **English** (except the app name "De Sprong" and subtitle "O, Romantiek Der Hazen")
- No unnecessary abstraction layers in the first version — keep it simple and readable
- Every route/component gets a short description at the top of the file
- `KEY_OPTIONS` constant lives in `src/lib/constants.ts` and is imported wherever a key dropdown is needed
