# USING CLAUDE CODE

## Using Claude Code in VSCode for De Sprong

### Step 0 — Install the extension

Search for "Claude Code" in the VSCode Extensions panel and install it. The first time you open the panel, a sign-in screen appears — click Sign in and complete authorization in your browser. After that, a Learn Claude Code checklist appears; work through it or dismiss it.

Click the ✱ Claude Code icon in the bottom-right status bar to open the panel. You can drag it anywhere in VSCode.

---

### Step 1 — First session: set up the project

Open your cloned `de-sprong` folder in VSCode. Then in the Claude Code panel:

**1. Run `/init`**  
This generates a starter CLAUDE.md from what Claude sees in the repo. Since you already have a CLAUDE.md, it will read yours and confirm it understands the project. Follow up with `/memory` to refine anything it got wrong.

**2. Set permissions**  
Run `/permissions` to set the approval rules you want — this controls whether Claude asks before editing files or can auto-accept. For a first project, keep it on "ask before editing" so you see every change.

**3. Run `/terminal-setup`**  
This auto-configures Shift+Enter for multi-line prompts in the VSCode terminal. Zero manual editing needed.

---

### Step 2 — The core workflow: Plan before you build

`/plan` puts Claude in read-only mode — it can read files and analyse your codebase but can't make changes. All proposed modifications are presented as plans requiring explicit approval. The Claude Code team themselves recommend planning before implementing.

Use it like this, before every significant build step:

```
/plan Set up the SvelteKit project with Tailwind, DaisyUI, Drizzle and SQLite as described in CLAUDE.md
```

You can review and edit Claude's plan before accepting it — the plan appears as a markdown document you can modify directly. Once you're happy, approve it and Claude executes.

**Good habit:** for every step in the build order in CLAUDE.md, start with `/plan`, read the plan, then approve.

---

### Step 3 — During a build session

**`@`-mentions instead of hoping Claude finds the right file**  
Use `@`-mentions to reference specific files, e.g. `@src/lib/constants.ts` or `@CLAUDE.md`. Press Alt+K (Windows) to insert an `@`-mention with a line range from your current selection. This is faster and more precise than asking Claude to search.

**`/diff` — review before accepting**  
When Claude wants to edit a file, it shows a side-by-side comparison of the original and proposed changes. You can accept, reject, or tell Claude what to do instead. If you edit the proposed content directly in the diff view before accepting, Claude is told that you modified it.

**`/model` and `/effort` — tune per task**  
`/model` and `/effort` adjust how much reasoning you're spending. Practical rule for De Sprong:
- Routine work (adding a field, fixing a typo): `/effort low`
- Normal feature work: default (no command needed)
- Complex logic (drag-and-drop, embed detection, file upload): `/effort high`

**`/btw` — quick aside without polluting history**  
Use `/btw` for a quick aside that shouldn't bloat history — e.g. `/btw remember the key dropdown uses KEY_OPTIONS from constants.ts`. It registers the note without becoming part of the main conversation thread.

---

### Step 4 — Context management (saving tokens)

This is the most important skill to develop. The general guidance is: use `/compact` when context usage exceeds about 80%, and `/clear` when switching tasks entirely.

**`/context`** — check before deciding  
Run `/context` to see where the context window is going — it shows how full it is. Check this regularly.

**`/compact`** — summarise, keep going  
When a long session fills the context window, `/compact` compresses the conversation history into a dense summary. You can pass instructions to steer what it retains: `/compact Focus on the database schema and the source page logic`. Use this when you're mid-feature and don't want to lose the thread.

**`/clear`** — clean slate  
Use `/clear` between unrelated tasks. Every time you start something new, clear the chat — you do not need all that history eating your tokens. For De Sprong: finish the main page, run `/clear`, then start the source page fresh.

**`/rewind`** — undo a mistake without losing the conversation  
You can choose "Rewind code only" to revert all file changes while keeping the conversation history intact — try an aggressive refactoring approach, discuss the results, decide it didn't work, then revert only the code. No more git stash gymnastics.

---

### Step 5 — After building: review and commit

**`/code-review`**  
Run `/code-review` to review the current diff for correctness bugs. You can pass an effort level: `/code-review high` for more thorough analysis. Do this after completing each step in the build order before committing to Git.

**`/cost`**  
Displays token usage and cost for the current session. Good for keeping an eye on spend, especially if you're on API billing rather than a Pro/Max subscription.

---

### Recommended workflow per build step

Here's the pattern to follow for each of the 10 steps in the CLAUDE.md build order:

```
1. /clear              (start fresh)
2. /plan [task]        (read the plan, edit if needed, approve)
3. Build happens — watch the diffs, accept/reject each one
4. @mention files      (when asking follow-up questions)
5. /context            (check how full the window is)
6. /compact [hint]     (if > 80% full and still working)
7. /code-review        (before committing)
8. Commit via Git      (in VSCode source control or terminal)
9. /clear              (before next step)
```

---

### Tips specific to your situation

- Keep CLAUDE.md under 200 lines — move details to separate files and import with `@filename`. Your current CLAUDE.md is well within that limit.
- Sessions started in the extension can be continued in the terminal with `claude --resume` — useful if you close VSCode and want to pick up where you left off.
- The commands you'll use 90% of the time are a small subset: `/clear`, `/compact`, `/init`, `/memory`, `/model`, `/review`. Master those first.