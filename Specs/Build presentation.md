# Building De Sprong with Claude Code
## How a non-framework developer built a full web app with AI — step by step

---

## What is Claude Code?

Claude Code is an AI coding assistant that runs inside VSCode. Unlike a chatbot, it has direct access to your files — it can read them, edit them, run commands in the terminal, and manage Git. You talk to it in plain English.

You give it instructions. It shows you what it's going to change (as a diff). You approve or reject each change.

---

## Before Claude Code: preparation

**Starting point:**
- A clear idea: a web app for managing jazz practice material
- Experience with C#, Java, PHP, JavaScript — but not recently, and not with modern web frameworks
- VSCode installed
- A GitHub account and empty repository at `github.com/Edvannunen/de-sprong`

**The most important first step:** writing a proper spec *before* touching any code.

---

## Phase 1 — Writing the spec

Claude Code reads a file called `CLAUDE.md` in your project folder. Think of it as a briefing document — Claude carries it into every conversation and uses it to make decisions independently.

We wrote the spec together over several conversations, adding to it in stages. It ended up covering:

- What the app does, who uses it, what device it runs on (iPad, mobile-first)
- The full data model with field names, types, and relationships
- Every screen, in precise layout terms
- Tech stack choices with reasoning (why SvelteKit, why SQLite, why DaisyUI)
- A numbered **Build Order** (9 steps, from scaffold to drag-and-drop)
- Code conventions: *"Write extensive comments. Explain the* why*, not the* what*. Always choose the readable solution over the clever one."*

**Example of a spec update (verbatim user input):**

> *"I want this to be added to the specs: As this is a webapp that will mainly be used on an iPad it should be mobile first. Cascading delete: when a piece is deleted the underlying sources should be deleted as well. Add timestamps (created_at, updated_at) to piece and source. Key (toonsoort) is in edit mode a dropdown field with the following values: C, Db, D, Eb, E, F, Gb, G, Ab, A, Bb, B, Cm, Dbm… Can be hardcoded as it will never change, a separate table is overkill."*

Claude incorporated that into the spec and confirmed what was updated.

> **Lesson:** The spec took more time than any individual feature. That investment paid off — Claude could make correct decisions without being told every time.

---

## Phase 2 — Understanding Claude Code before building

Before writing a single line of code, we asked:

**User:**
> *"Now I have the specs ready, I have VSCode installed, a Github repository created, images added to the repo. What are the next steps when I want this to be created in Claude Code? Please add details on how to use Claude Code in VSCode, what are the best slash-based actions to use in what order (like plan, model and effort, diff, code-review etc), when to use clear or compact to save tokens. As this is all new to me."*

**Claude explained the workflow:**

```
Per build step, follow this pattern:

1. /clear              → start a fresh conversation (clears context, not files)
2. /plan [task]        → Claude reads the specs, proposes a detailed plan
3. Review the plan     → read it, edit if needed, then approve it
4. Build happens       → Claude edits files; each change appears as a diff
5. Accept or reject    → click ✓ to accept or ✗ to reject each file change
6. /context            → check how full the context window is
7. /compact [hint]     → compress history if > 80% full and still working
8. Commit via Git      → "Git: commit these changes as [description]"
9. /clear              → before starting the next feature
```

**Key slash commands:**

| Command | What it does |
|---|---|
| `/plan [task]` | Claude reads your files and writes a step-by-step implementation plan before doing anything |
| `/clear` | Starts a fresh conversation — Claude forgets the chat history but still reads CLAUDE.md |
| `/compact [hint]` | Summarises the conversation to save space — use when context > 80% full |
| `/context` | Shows how much of the context window is used (e.g. "34% — 67k / 200k tokens") |
| `/code-review` | Claude reviews the code it just wrote for bugs and improvements |

---

## Phase 3 — Setting up the project (Build Order step 1–3)

**User:**
> *"Set up the SvelteKit project with Tailwind CSS, DaisyUI, Drizzle ORM, SQLite, Vitest, and Playwright."*

Claude ran all installation commands in the terminal:

```bash
# Create SvelteKit project (Claude chose the options: TypeScript, ESLint, Prettier)
npm create svelte@latest de-sprong
cd de-sprong
npm install

# Tailwind CSS
npm install -D @tailwindcss/vite tailwindcss

# DaisyUI (component library on top of Tailwind)
npm install -D daisyui

# Database
npm install drizzle-orm better-sqlite3
npm install -D drizzle-kit @types/better-sqlite3

# Drag-and-drop (Svelte-native, works on touch and desktop)
npm install svelte-dnd-action

# Testing
npm install -D vitest @playwright/test
```

Claude then generated ~15 configuration files: `vite.config.ts`, `tsconfig.json`, `drizzle.config.ts`, `app.html`, `svelte.config.js`, ESLint config, Prettier config, and more.

**Packages installed: 12 · Config files generated: ~15**

---

## Phase 4 — Building features, one by one

Each feature followed the same pattern. Here are the actual sessions:

---

### Build step 4: Database schema + seed

**User:**
> *"/plan Database schema and seed with two categories Songs and Exercises"*

Claude proposed a plan showing exactly which files it would create and what each table would look like. After approval, it created:

- `src/lib/server/schema.ts` — the three tables (`category`, `piece`, `source`) with all fields
- `src/lib/server/db.ts` — the Drizzle database client
- `src/lib/constants.ts` — the 24 key values (C, Db, D… Bm)
- `scripts/seed.ts` — a script to create the two default categories
- `drizzle/` — the generated SQL migration files

**Commands run:**
```bash
npm run db:generate    # generate SQL migration from the schema
npm run db:migrate     # apply migration to de-sprong.db
npm run db:seed        # insert "Songs" and "Exercises" categories
```

---

### Build step 5: Main page — tabs, piece list, inline edit

**User:**
> *"/plan Main page: tabbed piece list with inline edit"*

Claude built `src/routes/+page.svelte` and `+page.server.ts`. The main page shows one tab per category, lists pieces sorted by priority then alphabetically, and lets you edit a piece name and key inline without leaving the page.

Key decisions Claude made independently (because the spec was clear):
- ♩ for top-priority pieces, ♫ for regular
- Three-column layout: Name (85%) | Key | Actions
- Confirmation dialog before every delete

---

### Build step 6: Source detail page — view/edit/sources

**User:**
> *"/plan Source page: view and edit piece + add/edit/delete sources"*

Claude built the source detail page at `/piece/[id]`. Default is view mode. An Edit button at the bottom switches to edit mode, where piece fields become inputs and source cards become editable forms.

---

### Build step 7: Link detection + YouTube/Spotify embeds

**User:**
> *"/plan Link detection and YouTube/Spotify embeds"*

Claude created `src/lib/linkDetector.ts` with a function that takes any URL and returns:
- A YouTube embed iframe (for `youtube.com/watch?v=...` or `youtu.be/...`)
- A Spotify compact embed (for `open.spotify.com/track/...`)
- A plain clickable link (for any other URL)
- Nothing (for an empty value)

Claude also wrote unit tests in `src/lib/linkDetector.test.ts` and they all passed:
```bash
npm run test
# ✓ 8 tests passed
```

---

### Build step 9: Drag-and-drop source ordering

**User:**
> *"/plan Drag-and-drop source reordering"*

Claude wired up `svelte-dnd-action` on the source list. Drag handles work on both desktop (mouse) and iPad (touch). After each drop, the new order is saved to the database immediately.

---

## Phase 5 — Session 2: uploads, tweaks, data import

This is the session documented in detail. All commands below are verbatim.

---

### Getting the code onto GitHub

**User:**
> *"Add all the changes to a branch in GitHub"*

Claude created a branch and pushed it. When git asked for an identity:

**User:**
> *"name 'Ed'"*

Claude set the global git config with name "Ed" and the email already stored in memory, then pushed successfully.

**User:**
> *"push the branch de-sprong-initial-setup to main branch"*

Claude handled the merge. There was a complication: the local repo and the GitHub repo had been created separately and had no shared history. Claude fixed it:

```bash
git merge de-sprong-initial-setup --allow-unrelated-histories
```

**User:**
> *"Git: Start a new branch 'Setup p.2' and make that the active branch"*

```bash
git checkout -b setup-p.2
```

---

### UI tweaks — plain English instructions

**User:**
> *"Add a shadow on the banner. Make banners and footers opacity 50%. Use borders around the tabs on main page. On the source page: make the notes box half the height in edit mode. Change the message 'Vul dit veld in' into English."*

Claude made all five changes in one pass. The Dutch message ("Vul dit veld in" = "Fill in this field") was a browser language issue — the browser uses its own UI language for native HTML validation. Claude fixed it with JavaScript:

```svelte
oninvalid={(e) => {
    (e.currentTarget as HTMLInputElement).setCustomValidity('Please fill in this field');
}}
oninput={(e) => {
    (e.currentTarget as HTMLInputElement).setCustomValidity('');
}}
```

---

### Planning a larger feature

**User:**
> *"/plan 'File attachment upload/display/delete (Build Order step 8)'"*

Claude entered plan mode, read all relevant files, and proposed a detailed plan covering:
- A new file-serving route (`src/routes/uploads/[filename]/+server.ts`)
- Two helper functions in the server (`saveUploadedFile`, `deleteFile`)
- Updates to four existing actions (`addSource`, `editSource`, `deleteSource`, `deleteAttachment`)
- UI changes: file input in edit mode, thumbnail/link display in view mode

After reviewing and approving the plan, Claude built everything.

---

### Reporting a bug with a screenshot

**User:** *(attached a screenshot of the source page)*
> *"When I add a new source, add all the data and click on the 'Save' button below (to save the piece page) and I have NOT clicked on the 'Add source' button to save the new source → it should ask 'Do you also want to save the new source?' On 'yes' it should add the new source first before saving the piece page."*

Claude implemented the guard logic: detect when the add-source form is open, intercept the Save click, show a confirmation dialog, and if confirmed — save the source first, then auto-save the piece.

```
User clicks Save
  └─ Is add-source form open?
       ├─ No  → save piece normally
       └─ Yes → "Do you also want to save the new source?"
                    ├─ Yes → save source first, then auto-save piece
                    └─ No  → save piece only
```

---

### Committing the branch

**User:**
> *"Github: Commit the branch"*

Claude checked what had changed, staged the right files, and committed with a descriptive message. It never commits automatically — it always waits to be asked.

---

### Viewing the database

**User:**
> *"How can I view the data in the database?"*

**Claude:**
Three options, best first:
1. **Drizzle Studio** — `npx drizzle-kit studio` → opens a web UI at `https://local.drizzle.studio`
2. **SQLite Viewer** — free VSCode extension, click `de-sprong.db` in the file explorer
3. **DB Browser for SQLite** — free desktop app at `sqlitebrowser.org`

---

### Importing the data

**User:** *(pasted a text file with 24 pieces and their YouTube/MuseScore/Spotify links in raw note format)*
> *"Add this raw data to the db. Show proposal before adding."*

Claude parsed the raw text, organised it into a clean table with source names, and presented it for review — including cleanup decisions:
- Removed duplicate URLs (same YouTube link appeared 3 times for one piece)
- Split "Kenny Barron – Art of Conversation" (an album) into two separate pieces: *Seascape* and *Rain*
- Local-only references with no URL ("PDF in bestanden", "Video Christian") moved to piece notes

After review:

**User:**
> *"Nice! Add it"*

Claude wrote `scripts/import-songs.ts` and ran it:

```bash
npx tsx scripts/import-songs.ts
```

```
Created: Golden Brown (4 sources)
Created: All of Me (7 sources)
Created: Alice in Wonderland (4 sources)
...
Import complete. Created: 24, skipped: 0.
```

**24 pieces and 98 sources imported in under 10 minutes from raw notes.**

---

### A small feature, plainly stated

**User:**
> *"One last change for today: on source page, the 'Top Priority' checkbox should always be visible, not only in edit mode. When toggled it should save that immediately."*

Claude added a small form with a checkbox in view mode that submits to a new `toggleTopPriority` action on change — no Edit/Save cycle needed.

---

### Final push to main

**User:**
> *"Commit the changes to the branch. Title 'File uploads, data import, tweaks'"*

**User:**
> *"Push the branch to main"*

Claude merged `setup-p.2` into `main` and pushed. There was a small hiccup (a failed first merge attempt left a stray file), which Claude diagnosed and resolved without any user input.

---

## How to read Claude's responses

When Claude makes a code change, VSCode shows a **diff** — the old code on the left, the new code on the right. You click **Accept** or **Reject** for each file.

When something goes wrong, Claude explains what happened and proposes a fix — you don't need to understand the error yourself.

When Claude is unsure about a decision, it says so and asks. Otherwise it makes the decision itself, based on the spec.

---

## The context window — what it is and why it matters

Every conversation has a **context window** — a limit on how much text Claude can hold in memory at once. Check it with `/context`:

```
Tokens: 67.6k / 200k (34%)
```

This is per-conversation, not per-month. It resets when you start a new conversation. When it gets full, use `/compact` to compress the history, or `/clear` to start fresh (Claude still reads CLAUDE.md so it remembers the project).

**Pro tip:** start a new conversation (`/clear`) between major features. It keeps Claude focused and prevents old context from causing confusion.

---

## How the collaboration worked

| User typed | Claude did |
|---|---|
| Plain English descriptions of what to build | Read the spec, planned the implementation |
| `/plan [feature]` | Wrote a detailed plan and waited for approval |
| Approved the plan | Built the feature, file by file |
| Accepted or rejected each diff | Nothing — waited for the next instruction |
| "Commit the changes" | Staged, committed with a descriptive message |
| "Push to main" | Merged branch and pushed |
| Pasted raw data | Parsed, cleaned, structured, and imported it |
| Described a bug in plain English | Found the cause and fixed it |

---

## By the numbers

| | |
|---|---|
| Sessions | ~4 |
| User messages (all sessions) | ~30 |
| Files created or modified | ~20 |
| npm packages installed | 12 |
| Lines of code written by Claude | ~1,000 |
| Pieces imported from raw notes | 24 |
| Sources imported | 98 |
| Time from raw notes to populated database | ~10 minutes |
| Bugs Claude introduced | A few |
| Bugs Claude fixed | All of them |

---

## Phase 6 — Session 3: design system, data import, UX fixes (29 June)

---

### Pastel colour palette + dynamic category tabs

**User:**
> *"Design polish + dynamic categories"*

Claude introduced a six-colour pastel palette as a design system and wired it into the category tabs:

- Tabs now have a pill shape with the category's palette colour and a piece-count badge
- Each tab gets a pencil icon that opens an **edit panel** inline below the tab row: rename, pick a colour via swatches, drag to reorder, delete (when empty)
- A **new category form** sits below the tab row with a name field and colour picker
- `PALETTE` moved into `constants.ts` as the single source of truth
- Source cards on the detail page each get the next palette colour as a background
- Delete buttons switched from red to amber; `btn-primary` overridden globally to amber-dark
- A **filter row** added to the main page: name search box + key dropdown, resets on tab switch
- Schema: `colorIndex` column added to the `category` table, migration `0001` generated and applied

10 files changed · 705 insertions

---

### Pop repertoire import

**User:** *(pasted raw text with 36 pieces and their links)*
> *"Add this raw data to the db."*

Claude wrote `scripts/import-pop.ts` and imported 36 Pop pieces with their sources — same pattern as the earlier Songs import.

```bash
npx tsx scripts/import-pop.ts
# Import complete. Created: 36, skipped: 0.
```

---

### Tab restore when navigating back

**User:**
> *"Back link on detail page should restore the originating tab."*

The detail page URL now carries a `?tab=` parameter. The Back link passes it back, and the delete-piece action also redirects to the correct tab. Previously both always landed on the first tab.

---

### Banner and footer design tweaks

Two quick rounds of image and styling updates:

1. Removed the amber colour overlay from banners and footers (they had been tinted to match the palette — cleaner without it)
2. Updated `banner_piece.png`, `banner_source.png`, and `footer.png` with new versions
3. Removed borders from banner/footer containers
4. Upgraded `shadow-md` → `shadow-xl` on all banner and footer wrappers

These landed as two separate commits in PR #3 — the second one came minutes after the first.

---

## Phase 7 — Session 4: hosting research, tooling, design updates

---

### Choosing a hosting platform

**User:**
> *"Help me with setting up Render. Their free tier, on the Frankfurt region."*

Claude walked through the Render setup — build command, start command, environment variables, region. The key issue: Render's free tier uses an **ephemeral filesystem**, meaning the SQLite database and uploaded files would be lost on every deploy or restart.

**User:**
> *"I don't see the Render Disk $1/month option. I think it doesn't exist anymore."*

Render had removed that option. Claude proposed alternatives (Turso, Neon, Cloudflare R2) but the user stepped back:

**User:**
> *"Give me other options what I can use to deploy the project to be used online, including our tech stack. The DB and upload persistence is essential as these are the sources."*

Claude compared platforms:

| Platform | Cost | SQLite | File uploads | EU region |
|---|---|---|---|---|
| Fly.io | Free tier (3 VMs + 3 GB volume) | Yes | Yes | Frankfurt |
| Railway | $5 credit/month | Yes (with volume) | Yes (with volume) | EU |
| Hetzner VPS + Coolify | ~€4/month | Yes, native | Yes, native | Frankfurt |

**User:**
> *"Fly.io no longer has a permanent free tier."*

Two platforms with outdated free tier information in one session. Claude updated its recommendation:

**Chosen platform: Hetzner VPS + Coolify**
- Hetzner CAX11: ~€4/month, Frankfurt, ARM server with 2 vCPU and 4 GB RAM
- Coolify: free, open-source, self-hosted dashboard — like a modern cPanel for apps
- Persistent storage is native (it's a real server, not a cloud ephemeral container)
- SQLite and file uploads just work

**User:**
> *"If I go for Hetzner VPS + Coolify what will happen for a new projects? Will that run on the same account, or do I need to pay for another account?"*

**Claude:** One Hetzner account, one server, unlimited projects. Coolify manages all apps through one dashboard — each with its own deployment config, environment variables, domain, and storage. No extra cost per project. Scale up the server if you ever max it out.

---

### Connecting Context7 to Claude Code

**User:**
> *"How can I connect VSCode/Claude Code to Context7 connector?"*

Context7 is an MCP (Model Context Protocol) server that feeds up-to-date library documentation into Claude Code — so Claude reads current docs instead of relying on training data.

Setup via the Claude Code CLI:
```bash
# Add to current project only:
claude mcp add --transport stdio context7 -- npx -y @upstash/context7-mcp@latest

# Or add globally (all projects):
claude mcp add --global --transport stdio context7 -- npx -y @upstash/context7-mcp@latest

# Verify:
claude mcp list
```

Usage: append `use context7` to any prompt:
> *"How do I set up adapter-node in SvelteKit? use context7"*

No extra VSCode configuration needed — the Claude Code extension picks up the MCP config automatically.

---

### Design update: unified banner + page title

**User:**
> *"New footer and banner. Use 'banner.png' as banner for all pages. 'footer.png' is just a new image."*

Previously each page had its own banner image (`banner_piece.png` for the main page, `banner_source.png` for the source detail page). Both now use a single `banner.png`. The old images were removed from `static/img/`.

Files changed:
- `src/routes/+page.svelte` — `banner_piece.png` → `banner.png`
- `src/routes/piece/[id]/+page.svelte` — `banner_source.png` → `banner.png`
- `static/img/banner.png` — new file added
- `static/img/footer.png` — updated

**User:**
> *"The webapp doesn't seem to have a title, it shows 'localhost' in the tab. Make that 'De Sprong'."*

Added `<svelte:head>` in the layout file — one change that covers every page in the app:

```svelte
<!-- src/routes/+layout.svelte -->
<svelte:head>
    <title>De Sprong</title>
</svelte:head>
```

**User:**
> *"Commit and merge the changes please."*

Claude staged the relevant files (skipping unrelated spec edits), committed directly to main with a descriptive message, and pushed.

---

## Phase 8 — Session 5: deploying to production (30 June)

---

### The plan

**User:**
> *"Can you help me with Hetzner VPS + Coolify installation. Make a plan"*

Claude drew up a 6-phase deployment plan:

1. Provision a Hetzner VPS (Ubuntu 24.04, Frankfurt)
2. Install Coolify via SSH
3. Connect GitHub to Coolify via a GitHub App
4. Create the application in Coolify (build + start command, persistent storage, env vars)
5. Domain + SSL
6. Run migrations and seed production data

---

### Phase 1–3: server, Coolify, GitHub

**User:**
> *"Ok. Start with step 1"*

Claude gave the exact Hetzner settings to pick (CX22, Ubuntu 24.04 LTS, Frankfurt), firewall rules, and the SSH command to connect. When the SSH host authenticity prompt appeared:

**User:**
> *"Getting this on Step 1.4"* *(screenshot of the fingerprint warning)*

**Claude:** That's expected — type `yes`. It saves the server's fingerprint so you're not asked again.

Coolify installed via a one-liner. GitHub connected through Coolify's GitHub App flow (automated installation, granting access to the `de-sprong` repository).

---

### Phase 4: wiring up the app — three code fixes

Creating the app in Coolify was straightforward. But the first deploys failed with a cascade of errors — each one requiring a fix in the code.

---

**Fix 1 — Node version**

Nixpacks (the Docker build system Coolify uses) was picking up Node 22.11.0, but the project requires ≥22.13.0. Adding a buildtime environment variable `NIXPACKS_NODE_VERSION=22.14.0` didn't bust the cached Docker layer. Fix: a `.node-version` file in the repo root — changing the file changes the Nixpacks plan hash, which forces a full cache rebuild.

```
22.14.0
```

---

**Fix 2 — database directory missing at build time**

```
Cannot open database because the directory does not exist
```

SvelteKit analyses all routes at build time, which imports `db.ts`. But the `data/` directory doesn't exist inside the Docker build container. Fix: create it explicitly before opening the database.

```typescript
// src/lib/server/db.ts
import fs from 'fs';
fs.mkdirSync('data', { recursive: true });   // no-op if already exists
const sqlite = new Database('data/de-sprong.db');
```

---

**Fix 3 — wrong adapter**

```
Cannot find module '/app/build'
```

`adapter-auto` (SvelteKit's default) doesn't reliably produce a `build/` directory in a Docker/generic Node environment. Fix: switch to `adapter-node`, which always outputs to `build/`.

```bash
npm install @sveltejs/adapter-node
```

```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-node';
```

After these three fixes, the app deployed successfully and was live at `http://y9l6zmpclf2aviur1yogksya.167.233.148.65.sslip.io`.

---

### Persistent storage + database path

In Coolify, a persistent volume was attached at `/app/data` — the directory where the app writes its SQLite database. Without this, every new deployment would wipe the database (Docker containers start with a clean filesystem).

The database path was also updated consistently across all files from `de-sprong.db` to `data/de-sprong.db`.

---

### Auto-migrate on every deploy

After the first successful deploy, the database was empty — migrations hadn't been run yet.

**User:**
> *"Will that not overwrite existing data in the production db when start?"*

**Claude:** No. A migration only changes the *structure* of the database (creating or altering tables) — it never touches the data inside them. Drizzle also tracks which migrations have already been applied in a `__drizzle_migrations` table, so if everything is up to date it's a complete no-op.

Fix: change the Coolify start command from `node build` to:

```
npm run db:migrate && node build
```

From that point on, every deployment applies any pending schema changes automatically before the server starts. If the schema hasn't changed, nothing happens.

> **Note:** this is separate from the one-time import scripts (`db:seed`, `import-songs.ts`, `import-pop.ts`) that populated the 60 pieces. Those ran once to fill the database with initial content — they're never needed again. All future changes to the data happen through the app itself. The data survives deployments because it lives in the persistent volume (`/app/data`), not inside the container.

---

### Seeding production data

With the database path and persistent volume now correct, all 60 pieces were imported directly into the running container:

```bash
docker exec <container-id> npm run db:seed
docker exec <container-id> npx tsx scripts/import-songs.ts
docker exec <container-id> npx tsx scripts/import-pop.ts
```

```
Import complete. Created: 24, skipped: 0.   # Songs
Import complete. Created: 36, skipped: 0.   # Pop
```

---

### Saves weren't working — the CSRF catch

After deployment the app loaded, data was visible — but nothing could be saved. Toggling Top Priority, changing a piece name: no effect. The Coolify logs showed nothing at all when a save was attempted.

Empty logs on a form submission is the tell: SvelteKit's CSRF protection rejects POST requests where the `Origin` header doesn't match, *before* any application code runs — so nothing gets logged.

The fix was adding an `ORIGIN` environment variable in Coolify:

```
ORIGIN = http://y9l6zmpclf2aviur1yogksya.167.233.148.65.sslip.io
```

First attempt used `https://` — still broken. Browser DevTools showed the request was being sent over plain `http://`. Changing to `http://` fixed it immediately.

**User:**
> *"It works. Thanks a lot! I would never been able to do this on my own"*

> **Lesson:** Empty logs + 403 on a form POST = CSRF block. Check the `Origin` header in DevTools — it tells you exactly what value `ORIGIN` needs to be.

---

### Auto-fill source name from filename

Small UX improvement: when adding or editing a source and the name field is still empty, picking a file attachment now automatically fills in the filename (without extension) as the source name. If a name was already typed, it stays untouched.

One `onchange` handler on the file input, looking up the sibling name field via `e.currentTarget.form?.elements.namedItem('name')`. Added to both the "add source" form and the "edit source" form.

---

### File upload size limit — the 413 error

Uploading a 1.6 MB photo produced a `413: Payload Too Large` error. The cause: `@sveltejs/adapter-node` defaults to a **512 KB** body size limit, controlled by an environment variable `BODY_SIZE_LIMIT` (parsed at server startup, not baked into the build).

Fix: add `BODY_SIZE_LIMIT=10M` as a runtime environment variable in Coolify. No code change needed. The limit applies per request, not as a total cap on all uploads.

---

### Going live on bier-en-brood.nl/de-sprong

The domain `bier-en-brood.nl` was registered and the app needed to run at the subpath `/de-sprong` (not the root), so other projects can share the same domain later.

Running at a subpath in SvelteKit requires setting `paths.base` in `svelte.config.js`:

```js
kit: {
  adapter: adapter(),
  paths: {
    base: '/de-sprong'
  }
}
```

Once `base` is set, every hardcoded path in the app needs the prefix — images, internal links, upload URLs, and server-side redirects. In `.svelte` files, `base` is imported from `$app/paths` and interpolated: `src="{base}/img/banner.png"`. In `.server.ts` files, the same import is used in `redirect()` calls. The favicon in `app.html` uses `%sveltekit.assets%` (SvelteKit's built-in placeholder) instead of `base`, since `app.html` is not a Svelte component.

**DNS:** the A-record for `bier-en-brood.nl` was set at Strato (the registrar) pointing to the Hetzner server IP `167.233.148.65`.

**Coolify:** domain set to `https://bier-en-brood.nl`, `ORIGIN` set to `https://bier-en-brood.nl` (just the origin — no path). SSL was issued automatically by Let's Encrypt.

**Deployment detour:** during the DNS propagation wait, a presentation had to happen. The new code (with `/de-sprong` base) was already deployed. The old sslip.io URL gave a 404 because Coolify's Traefik proxy only routes the configured domain. Solution: the app was reachable at `http://y9l6zmpclf2aviur1yogksya.167.233.148.65.sslip.io/de-sprong` — same code, just with the base path appended.

> **Lesson:** when Coolify's domain is changed, Traefik immediately stops routing the old hostname. The `/de-sprong` base path also means the root URL now 404s — the app lives at the subpath, not at `/`.

---

## What's next

- Playwright end-to-end test suite
- Authentication (later version)

---

## Summary: how to build a project with Claude Code

1. **Write a spec first.** Put it in `CLAUDE.md`. The better the spec, the better the output.
2. **Use `/plan` before every feature.** Read the plan. Edit it if something is wrong. Then approve.
3. **Give instructions in plain English.** "Add a shadow to the banner" works. You don't need to know the CSS.
4. **Accept or reject each diff.** You're always in control of what goes into your code.
5. **Tell Claude to commit.** It won't do it automatically. "Commit the changes" or "Commit with title X" is enough.
6. **Use `/clear` between features.** Keeps the conversation focused.
7. **Use `/context` to monitor.** If it's over 80%, use `/compact` before continuing.

---

*Built with: SvelteKit · TypeScript · SQLite · Drizzle ORM · Tailwind CSS · DaisyUI · svelte-dnd-action*
*Developed using: Claude Code (Anthropic) in VSCode*
*Last updated: 1 July 2026*
