---
name: preview-eitri-section
description: Run a local Eitri app on a device/emulator via Eitri Play to visually validate a change before opening a PR — especially a shared Deco CMS section. Use when asked "como rodar", "ver na tela", "validar visualmente", "preview no emulador/Eitri Play", or to confirm a shared/src/sections change actually renders. NOT for running the E2E suite (that's docs/maestro.md).
---

# Preview an Eitri app / Deco section on a device

Goal: see a local change rendering in **Eitri Play** on a real device or emulator,
before PRing. The common hard case is a **shared Deco section** — it has no page of
its own, so it only renders once it's placed on a page that some app mounts.

## Prerequisites (check first — the usual blockers)

0. **No device at all?** `adb devices` empty and no AVD exists → run the
   `android-emulator-eitri` skill first (provisions the AVD, boots it, installs Eitri Play).
   If an AVD already exists but isn't running: `emulator -avd <name> -no-snapshot-load &`,
   then poll `adb shell getprop sys.boot_completed` until it prints `1`.
1. **Device connected:** `adb devices` must list one as `device` (Wi-Fi: `adb connect <ip>:<port>`).
2. **Eitri Play LOGGED IN on the device.** The dev launcher ("Run Eitri-App" accordion +
   slug field) only appears *after* login. A fresh/force-stopped Eitri Play lands on the
   **Login / I have an invitation** screen — logging in is a manual step (credentials); do
   not automate it. If a screenshot shows that screen, stop and ask the user to log in.
3. `eitri` CLI available (`which eitri`).

## Step 1 — start the dev server

Run from the workspace root, in the **background** (it never exits):

```sh
eitri app start
```

It builds every app in `app-config.yaml`. Wait until each app you need prints
`✓  Pronto para desenvolvimento!`. The `home` app also prints a QR code. The dev server
reads page/section files **from disk**, so uncommitted edits (e.g. a section added to
`shared/.deco/blocks/pages-Home.json`) render live.

Watching for readiness from a background run (don't foreground-`sleep`):

```sh
# f = the eitri-app-start output file
until grep -q "home .*Pronto para desenvolvimento" "$f"; do sleep 3; done
```

## Step 2 — open the target app on the device

Two ways, pick one:

- **(A) Terminal (simplest, human only):** in the interactive `eitri app start` terminal,
  type `a` + Enter → opens on the connected **Android** (`i` for iOS, `r` to reload, `q` to
  reshow QR). **Does not work from an agent session:** the CLI reads this via
  `readline`/raw-mode keypress, which requires a real TTY (`stdin.isTTY`). Backgrounding the
  process with `nohup ... &` and wiring a named pipe to its stdin (`mkfifo`, `exec 3<>fifo`,
  `eitri app start -p 0<&3 ...`) does *not* satisfy that — `echo a > fifo` is silently
  swallowed, no reaction in the logs, confirmed by testing. Use (B) instead when driving this
  from an agent/script.
- **(B) Maestro bootstrap (scriptable):** launches the app via the dev launcher by slug.
  Requires Eitri Play already logged in (see prereq 2).

  ```sh
  maestro test .maestro/subflows/bootstrap.yml -e APP_SLUG=<app-workspace-name>
  ```

  Slugs are the folder names, e.g. `eitri-shopping-template-vtex-deco-home`. Same subflow the E2E
  flows use — see its inline comments and `docs/maestro.md` for the point-tap / persistence
  gotchas. Via the Maestro MCP: `run` with `files: [".maestro/subflows/bootstrap.yml"]` and
  `env: { APP_SLUG: ... }`, then `take_screenshot`.

## Step 3 — for a shared Deco section: which app renders it?

A `shared/src/sections/*.tsx` section renders only when it's a block in a page **and** an
app mounts that page via `<DecoCMSContentRender page='...' />`. Map it:

| Page block file | Mounted by | Open this app |
|---|---|---|
| `shared/.deco/blocks/pages-Home.json` | `home/src/views/Home.jsx` (`page='Home'`) | `eitri-shopping-template-vtex-deco-home` |
| `shared/.deco/blocks/pages-Categories.json` | `home/src/views/Categories.jsx` (`page='Categories'`) | `eitri-shopping-template-vtex-deco-home` |

To preview a section that isn't on a page yet, add one block with its `__resolveType`
(e.g. `"site/sections/YourSection.tsx"`) to the page JSON — near the top so it's above the
fold. **This is a throwaway preview edit:** it often uses a placeholder icon/props — do not
commit it as-is, and revert it (or restore the real asset) before PR.

Home gates the CMS behind VTEX config (`enableCmsQuery`), so give it a few seconds after
launch before asserting/screenshotting.

## Step 4 — verify

`inspect_screen` (never author selectors from a screenshot — text matcher is whole-string
regex, IGNORE_CASE), then `take_screenshot`. For a stateful section, note which states need
data: some sections may require a logged-in VTEX session to display all states.

## Step 5 — drive real interactions (optional, proves it actually works)

Once the app is open, it's a normal Maestro-controlled screen — not just a static preview.
`inspect_screen` to get real `rid`/`text` values (never guess them from the screenshot), then
`run` a `tapOn`/`inputText`/`scrollUntilVisible` against those. Example: tapping a
`product-card-<id>` node from the home grid navigates into the real PDP, proving the
end-to-end flow (build → open → navigate) works, not just that the first screen rendered.

## Before you push

- Bump `version` in the app's `eitri-app.conf.js` (`--shared` for the shared app) — see AGENTS.md.
- Drop the throwaway page-block/placeholder-icon edit from the commit.

## See also
- `docs/maestro.md` — full Maestro setup, flow authoring, subflow output.
- `AGENTS.md` — Deco sections authoring/registration, tab→app mapping, Bifrost gotchas.
