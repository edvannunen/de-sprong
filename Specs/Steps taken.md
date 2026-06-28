# Steps taken

## First setup
* Installed VSCode
* Created repo in Github: https://github.com/Edvannunen/de-sprong

## Finalizing specs
* Added extra specs to Claude AI
* Added info about the design in the specs and added images (header, footer) to repo

## Asked Claude for next steps
"Now the have the specs ready, I have VSCode installed, Github repository created, images added to the repo. What are the next steps when I want this to be created in Claude Code? Please add details on how to use Claude Code in VSCode, what are the best slash-based actions to use in what order (Like plan,  model and effort, diff, code-review etc), when to use clear or compact to save tokens. As this is all new to me". 

See also [USING CLAUDE CODE](<USING CLAUDE CODE.md>)

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
### Tips specific to your situation

- Keep CLAUDE.md under 200 lines — move details to separate files and import with `@filename`. Your current CLAUDE.md is well within that limit.
- Sessions started in the extension can be continued in the terminal with `claude --resume` — useful if you close VSCode and want to pick up where you left off.
- The commands you'll use 90% of the time are a small subset: `/clear`, `/compact`, `/init`, `/memory`, `/model`, `/review`. Master those first.

