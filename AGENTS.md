# AGENTS.md

Conventions for working in this repository — an Eitri Shopping multi-app bundle (`app-config.yaml`) targeting VTEX, built with **Luminus** (UI) and **Bifrost** (native bridge). Apps: `home`, `account`, `checkout`, `pdp`, `cart`, plus the shared component/service library `eitri-shopping-template-vtex-deco-shared`.

This file documents conventions adopted during the JS → TypeScript migration (2026) and the rules that apply to all code written here from now on, TypeScript or not.

## Always use current, idiomatic TypeScript / ECMAScript

- Prefer `const`/`let` (never `var`), optional chaining (`?.`), nullish coalescing (`??`), template literals, destructuring, and array/object spread.
- Type every function's parameters and return type explicitly on public/exported functions; let inference handle the rest.
- Prefer `interface` for object/props shapes, `type` for unions/aliases.
- Use `unknown` over `any` wherever the caller must narrow before use; reserve `any` for cases where a real cast is unavoidable (see "Casting around library `.d.ts` gaps" below) and always comment why.
- Prefer `Array.prototype` methods (`.map`, `.filter`, `.reduce`, `.find`, `.some`, `.every`) over manual loops; use `for...of` when a loop is genuinely clearer.
- Use `async`/`await` over raw `.then()` chains for new code.
- No `var`, no implicit globals, no `== ` (use `===`/`!==`).

## Eitri / Luminus project rules (see the `eitri-specialist` and `eitri-luminus` skills for full detail)

- **No raw HTML tags** (`div`, `span`, `img`, `button`, etc.) — use `eitri-luminus` components (`View`, `Text`, `Image`, `Button`, ...). The one accepted exception in this codebase is inline `<svg>`/`<path>` icon markup, and the vendored `Slider` component's `<div ref={...}>` (needed for direct DOM access by the vendored keen-slider library).
- **Import Luminus components and React hooks explicitly.** Pre-2026 code in this repo used `View`, `Text`, `Image`, `useState`, `useEffect`, etc. without any import statement — this worked only because of implicit build-time injection and meant real type-checking was impossible (worse: `Image`/`Text` silently resolved to the wrong *DOM* globals instead of erroring). Always write `import { View, Text, ... } from 'eitri-luminus'` and `import { useState, ... } from 'react'`.
- **Component convention:**
  ```tsx
  interface XProps {
  	someProp?: string
  	[key: string]: unknown
  }

  export default function X(props: XProps) {
  	const { someProp } = props
  	// ...
  }
  ```
  Never an arrow function for the main export. Never destructure in the function signature — destructure in the body.
- Sizing (`width`, `height`, `minWidth`, `maxWidth`, `minHeight`, `maxHeight`) are direct component props, not CSS. Styling goes through `className` (Tailwind/DaisyUI). Avoid `hover:`/`focus:`/`active:`/`focus-within:` Tailwind variants — they cause "stuck" states on mobile touchscreens.
- Views under `src/views/` are file-based routes; type their props with a local `RouteProps` interface (see `src/types/route.ts` in any app) — `props.match.params` and `props.location.state` are both `undefined` when the view opens without parameters, so never chain into them unguarded.

## TypeScript gotchas specific to this codebase

- **`View`'s `onClick` prop resolves to `(() => void) & MouseEventHandler<HTMLElement>`.** If your handler needs the event, the parameter must be *optional*: `onClick={(e?: MouseEvent<HTMLElement>) => e?.stopPropagation()}`. A required `(e: MouseEvent) => void` fails to satisfy the `() => void` half of the intersection.
- **`react-icons` has no first-party `.d.ts` and isn't declared in any `eitri-app.conf.js`.** A hand-written shim lives at `eitri-shopping-template-vtex-deco-shared/src/types/react-icons.d.ts` and is globally visible to every app in the bundle (the root `tsconfig.json`'s `include` covers the whole workspace). Add new icons there — don't create per-app duplicates. **Separately:** since `react-icons` is used but never declared in any `eitri-app-dependencies` block, treat this as a real, open finding — the bundle likely only resolves it today via hoisting from another package's `node_modules`, which is fragile. Confirm with the Eitri specialist docs' supported-dependency table (react-icons pinned at `5.5.0`) and declare it explicitly if a build ever fails to resolve it.
- **Ambient `.d.ts` shim files must have zero top-level imports that could fail to resolve.** If a shim's own `import` fails, TypeScript silently drops *every* `declare module` block in that file — with no error pointing at the real cause. Keep shims self-contained (inline the prop types) rather than importing `react`'s types into them.
- **`Eitri.http.post(url, data, config)` expects `config.headers`, not flat header keys.** `Eitri.http.post(url, payload, { 'Content-Type': ..., 'application-id': ... })` compiles under loose JS but silently drops every header — found and fixed in `shared/src/services/Datadog.ts`. Always write `Eitri.http.post(url, payload, { headers: { ... } })`.
- **`Eitri.navigation.back(steps: number)` requires a numeric argument** even though its JSDoc/example shows a zero-arg call. Default to `Eitri.navigation.back(1)` rather than passing a page-name string or omitting it.
- **The shared library has two identically-shaped names — don't confuse them:** `eitri-shopping-template-vtex-deco-shared` is *this* workspace's local `shared` app (resolves to `./eitri-shopping-template-vtex-deco-shared/src/export.ts`). `eitri-shopping-vtex-shared` is a *different*, externally-published package (resolves via a generated `.d.ts` stub in `~/.eitri/<app-id>/@types/`). Both are imported across the codebase — check which one you actually mean.
- **Casting around library `.d.ts` gaps:** when a Luminus component's `.d.ts` is provably tighter than real, pre-existing usage (a prop it doesn't declare, like `View`'s missing `backgroundColor`, or legacy props from an older API version), preserve the exact runtime behavior with a local override rather than deleting the prop or rewriting the component:
  ```ts
  // View has no `backgroundColor` prop — kept as-is (pre-existing, likely a no-op at runtime).
  const ViewAny = View as unknown as (props: Record<string, unknown> & { children?: ReactNode }) => JSX.Element
  ```
  Always leave a one-line comment explaining the gap.

## Domain types

Each app has its own `src/types/vtex.ts` with **partial** interfaces for the VTEX payload shapes it actually touches (cart/OrderForm, product, SKU, SLA/logistics, address, etc.), always with an index signature `[key: string]: unknown` — real VTEX payloads have far more fields than any given screen consumes. These are deliberately duplicated per app rather than centralized, so each app stays independently buildable without a source-level dependency on a sibling app's internals. `eitri-shopping-template-vtex-deco-shared/src/types/vtex.ts` has the most complete set modeled so far — use it as a reference for field names when adding to another app's copy.

## Runtime safety (non-negotiable, always — not just during migration)

An Eitri-App runs in a WebView with no dev-time type checker between your code and production: a `TypeError` blanks the user's screen. Every piece of code must be defensive by default:

- Guard property access on data you didn't create in the same function (`?? []` before iterating, `?.` before descending, `?? ''` before calling string methods, `?? 0` only where zero is the correct business value).
- Never render a bare optional expression (`{product?.price}`) — resolve it to a value first and choose an honest fallback (`'—'`, an unavailable state) rather than a value that silently looks correct.
- Wrap every `Eitri.http`/native call in `try/catch` with a real fallback state, never a silent `catch {}`.
- Guard Bifrost calls with `Eitri.canIUse(...)` where availability isn't guaranteed.

See the `eitri-specialist` skill for the full checklist — it applies to every line touched, TypeScript or not.
