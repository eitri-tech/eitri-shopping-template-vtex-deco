# Agents Guide for Eitri Shopping Template (Deco)

> **This is a template project.** Customize this guide for each client by replacing generic references with the client's store name, adjusting product-specific variation patterns, and removing sections that do not apply.

This project follows a multi-module architecture where different Eitri-apps (Home, Account, Cart, PDP, Checkout) share common logic and components via a shared library. This guide helps you understand the codebase and choose the right agent to use based on your task.

## Overview

Multi-app **Eitri workspace** (React web mini-apps, mobile-only, rendered in an Android/iOS WebView) for a **VTEX e-commerce store**, backed by **VTEX** (Intelligent Search GraphQL + Checkout/OrderForm APIs). Root `app-config.yaml` defines 6 apps; dev server starts with `eitri app start` (`eitri app start -p` on CLI >= 1.57.0 -- see Gotchas). Apps navigate to each other via `Eitri.nativeNavigation.open({ slug, initParams })`. The native shell shows bottom tabs: Inicio, Categorias (both -> home), Sacola (-> cart), Perfil (-> account).

**Constraints (all apps):** eitri-luminus components only (no raw HTML tags), Tailwind + DaisyUI, no `hover:`/`focus:`/`active:` utilities, file-based routing under `src/views/`, main exports are named `function` declarations (no arrow functions, no signature destructuring). Common deps everywhere: `eitri-luminus 2.22.6`, `eitri-bifrost 5.4.0`, `eitri-shopping-vtex-shared 1.15.4` (the `Vtex.*` API wrapper), `eitri-shopping-template-vtex-deco-shared`, `eitri-i18n` (pt-BR).

**Cross-app patterns:** every consumer app has a `LocalCart.jsx` provider (`useLocalShoppingCart()`) and `SnackBar.jsx` provider (`useSnackBar()`); services wrap `Vtex.*` calls; state syncs across apps via VTEX EventBus; analytics via shared `TrackingService` (GA4 + Insider).

## Project Structure & Technology Stack
- **Not an npm/pnpm monorepo.** There is no `package.json` anywhere in the repo (root or per module), and no `pnpm-workspace.yaml`/`lerna.json`/`turbo.json`/`nx.json`. Each Eitri-app has its own `eitri-app.conf.js` declaring its name, version, and `eitri-app-dependencies` -- that's where dependency versions live. The root `app-config.yaml` lists the apps and their aliases.
- **Modules** (real folder name -- alias used in `app-config.yaml`):
    *   `eitri-shopping-template-vtex-deco-shared` -- shared
    *   `eitri-shopping-template-vtex-deco-home` -- home
    *   `eitri-shopping-template-vtex-deco-cart` -- cart
    *   `eitri-shopping-template-vtex-deco-checkout` -- checkout
    *   `eitri-shopping-template-vtex-deco-pdp` -- pdp
    *   `eitri-shopping-template-vtex-deco-account` -- account
- **Shared Layer**: `eitri-shopping-template-vtex-deco-shared` - Foundation containing UI components (exported via `src/export.js`), shipping resolvers (`src/utils/*ShippingResolver.js`), tracking/Datadog service, and i18n locales.
- **Dynamic Component Registry**: Any `.js/.ts/.jsx/.tsx` file placed in a module's `src/sections` folder is auto-exposed to the **Deco** CMS as a "section" (see root `README.md` for the mechanism). This folder only exists in `eitri-shopping-template-vtex-deco-shared/src/sections`, where the legacy home CMS components are being migrated as typed Deco sections -- see **[Deco CMS Sections](#deco-cms-sections-sharedsrcsections)** below for the authoring/registration pattern.
- **Stack**: React, Tailwind CSS + DaisyUI, react-i18next (imported as `eitri-i18n`).
- **Coding conventions**: The root **`.aiconfig`** file is the authoritative rules doc for writing UI in this project -- it lists the full restricted set of `eitri-luminus` components (only those tags are allowed, no raw HTML tags), forbids the `style` prop (Tailwind/DaisyUI classNames only), documents file-based routing under `src/views`, and the `Eitri.navigation.navigate()` API. **Read it before writing or editing any component/view.**
- **Platform Services** (declared per-app in `eitri-app.conf.js`):
    *   `eitri-bifrost`: Core platform/native bridge, imported as `import Eitri from 'eitri-bifrost'`.
    *   `eitri-luminus`: Restricted UI component library (see `.aiconfig`).
    *   `eitri-commons`: Declared as a dependency in every app, but no direct import of it was found in current source -- treat its "shared utilities" role as unconfirmed until you see it actually used.
    *   `eitri-shopping-vtex-shared`: Additional shared Eitri-app dependency present in every module's `eitri-app-dependencies`.

## Module Guide

### `shared/` -- eitri-shopping-template-vtex-deco-shared

Component/service library consumed by all other apps. Everything is exported from `src/export.js`.

- **Components:** Header blocks (`HeaderReturn`, `HeaderCart`, `HeaderLogo`, `HeaderSearch`, `HeaderText`, `HeaderContentWrapper`...), `ProductCardDefault`/`ProductCardFullImage`, `SkuSelector`, `CustomButton`/`CustomInput`/`CustomCheckbox`, `Slider` (KeenSlider) + `SliderPagination`, `LoginModal`, `Loading` (Lottie), `BadgeRender`, `GenericBox`, `GenericError`, `BottomInset`, `Spacing`, `Divisor`.
- **Services:** `TrackingService` (GA4 + Insider events: addToCart, viewItem, purchase, beginCheckout...), `Datadog` (log shipping), `NewsletterService` (Marketing Cloud + VTEX master-data), `BadgesService`/`getBadgesForProducts` (CMS promo badges, 24h cache).
- **Utils:** `shippingResolver`, `cartShippingResolver`, `productGroupShippingResolver` (parse VTEX logisticsInfo/SLAs); `utils.js` (price formatting, dates, shipping estimates); `productVariations.js` (product grouping/sibling utilities -- see "Product Variation Patterns" below); `skuSort.js`; `constants.js` (HEADER_TYPE, DIMENSIONS).
- **Rule:** new shared components go in `src/components/` and MUST be exported from `src/export.js`.

### `home/` -- storefront, search, catalog

The largest app: CMS-driven home, search, and category browsing.

- **Views:** `Home.jsx` (CMS sections), `Search.jsx`, `ProductCatalog.jsx` (faceted PLP), `Categories.jsx`, `LandingPage.jsx` (CMS pages by name), `Error.jsx`, `Cartman.jsx` (hidden debug).
- **CMS rendering flow:** `CmsService.getCmsContent()` (VTEX CMS, date-range + Firebase Remote Config filtering, 24h cache) -> `CmsContentRender` -> `utils/getMappedComponent.js` maps section name -> component in `src/components/CmsComponents/` (Banner with multiple modes incl. SliderHero, ProductShelf, ProductTiles, HighlightedProductShelf, ProductInfiniteScroll, CategoryTree/ListSwipe/ListVtex/Accordion/Gallery, LastSeenProducts, BlogPostShelf, VtexAdsBanner, RichText, NewsLetter, OverHeader...). Section schemas: `public/cms/sections.json`. Banner clicks dispatch via `ResolveCmsActions.processActions()`.
- **Services:** `ProductService.js` (Intelligent Search GraphQL: `getProductsService`, facets, `getProductSiblingsService` for product variation swatches, EAN lookup, category tree; PAGE_SIZE=12), `CmsService.js`, `CartService.js`, `CustomerService.js` (login/wishlist), `NavigationService.js` (path normalization + cross-app opens), `SearchMetadataService.js` (top searches/history), `VtexAdsService.js` (NewTail sponsored banners), `RemoteConfigService.js`, `AppService.js`.
- **Notable:** `ProductCard` + variation swatches component (sibling products grouped by a linking product property; siblings are separate productIds, not SKUs).

### `pdp/` -- product detail page

Single view: `src/views/Home.jsx` loads product by id/slug and composes the page.

- **Components:** `ImageGallery`/`ImageCarousel`, `SkuSelector` (SKU variations -- e.g. size, color), `MaterialSwatches` (sibling product variants via a grouping facet), `MainDescription` (price/installments), `ActionButton` (fixed "Comprar"), `Freight` (ZIP -> cart simulation -> delivery/pickup options), `Description`/`Information` accordions, `RelatedProducts` ("who saw also saw"), `Wishlist`, `Share`, `Rating`, `Quantity`.
- **Services:** `productService.js` (byId/bySlug/siblings/whoSawAlsoSaw/lastViewed), `cartService.js`, `freightService.js`, `customerService.js`, `NavigationService.js`, `CmsService.js`, `SearchMetadataService.js`, `AppService.js`.
- **Utils:** `skuSort.js` (size-aware SKU ordering), `utils.js` (`formatProductFromVtex`, price/discount helpers).

### `cart/` -- shopping bag

- **Views:** `Home.jsx` (items, coupon, freight, summary, checkout button), `EmptyCart.jsx`.
- **Components:** `CartItemsContent`/`CartItem` (qty, remove, bundle offerings), `CartSummary` (totalizers), `Coupon`, `Freight` (cannotBeDelivered warning + ZIP recalculation), `MinimumOrderValue` (progress bar from Remote Config `minimumOrderValueInCents`), `ActionButton` (checkout, disabled until valid), `ModalConfirm`, `InstallmentsMsg`.
- **Services:** `cartService.js` (items, offerings, coupons), `freigthService.js` [sic -- misspelled], `customerService.js`, `navigationService.js`, `trackingService.js`, `AppService.js`.
- **Checkout handoff:** validates items available + minimum order value, then `navigateToCheckout(cart.orderFormId)` -> opens checkout app with `initParams: { orderFormId }`.

### `checkout/` -- checkout & payment

Multi-step flow, ~21 views: `Home` (init) -> `PersonalData` (email/CPF/CNPJ, OTP email validation) -> `AddressForm`/`AddressSelector` -> `FreightResolver`/`FreightSelector`/`MultipleFreightSelector`/`PickupSelector` -> `ShippingMethod` -> `PaymentData` -> `AddCardForm`/`StoreCardForm`/`Installments` -> `CheckoutReview` (reCAPTCHA + `Vtex.checkout.payV2`) -> `PixOrder` (QR + polling, 10-min timeout) / `ExternalProviderOrder(Finished)` / `OrderCompleted`.

- **Payment methods** in `components/PaymentsGroups/Groups/`: CreditCard (saved cards, jsencrypt RSA), GooglePay (`GPayService.js`), GiftCard, StoreCard, BankInvoice (boleto), InstantPayment (PIX), ExternalPayment.
- **Providers:** `LocalCart.jsx` (orderForm mutations), `Customer.jsx`, `SnackBar.jsx`.
- **Services:** `cartService.js`, `CustomerService.js`, `freigthService.js`, `navigationService.js`, `Tracking.js`, `Recaptcha.js`, `GPayService.js`, `AppService.js`.
- **Utils:** `vtexErrorMap.js` (VTEX error -> friendly message), `paymentSystemResolver.js`, `verifySocialNumber.js`.

### `account/` -- auth & profile

- **Views:** `Home` (dashboard), `SignIn` (email/password, access-key, Google/Facebook OAuth), `SignUp`, `PasswordReset(Code/NewPass)`, `ChangePassword`, `EditProfile`, `OrderList`/`OrderDetails` (status timeline, buy-again), `Wishlist`, `AddressList`/`AddressForm`, `SavedCards`/`AddCardForm`.
- **Key components:** `ProtectedView` (redirects unauthenticated -> SignIn), `OrderCard`/`OrderStatusBadge`/`OrderStatusTimeline`/`OrderBuyAgain`, `SocialLogin`, `ModalConfirm`, `InfiniteScroll`.
- **Services:** `CustomerService.js` (auth, profile, orders, wishlist, cards), `AddressService.js`, `CartService.js`, `StoreService.js` (OAuth providers), `Recaptcha.js`, `NavigationService.js` (PAGES constants), `TrackingService.js`, `AppService.js`.
- **Note:** other apps trigger login by opening this app (`requestLogin()`); auth state propagates via EventBus.

## Product Variation Patterns

This template supports two levels of product variation. Which patterns apply depends on how the VTEX catalog is configured for the client store:

1. **SKU-level variations** -- Variations within a single product (e.g. size, color). These live in `items[].variations` and are handled by the `SkuSelector` component. The `skuSort.js` utility orders variation values intelligently (letter sizes, numeric sizes, etc.).

2. **Sibling products** -- Separate VTEX products that represent variants of the same item (e.g. different materials, colors, or configurations). These are linked by a shared product property (configured per store -- commonly a grouping code in `product.properties[]`) and a corresponding Intelligent Search facet. `getProductSiblingsService` fetches the sibling group; `MaterialSwatches` (PDP) and compact swatch components (home) render the options. Tapping a sibling opens a new PDP for that product.

   The shared utilities in `productVariations.js` / `metalSwatches.js` (`getAgrupadorCode`, `getProductProperty`, `groupSiblingsByCode`) handle grouping. **Adapt the property name and facet key to match the client's catalog structure.**

> **Template note:** The default implementation uses `Codigo Agrupador` as the linking property and `codigo-agrupador` as the IS facet. Update these values in the shared utils and product service if the client store uses different property/facet names.

## Deco CMS Sections (`shared/src/sections`)

New CMS componentization model: CMS blocks are authored as **typed sections** in
`shared/src/sections/` and consumed by the **Deco** CMS. This is migrating the legacy
home CMS components into the shared layer. Two rendering paths currently coexist:

| | **Legacy (home)** | **Deco (shared)** |
|---|---|---|
| Location | `home/src/components/CmsComponents/` | `shared/src/sections/` |
| Language | `.jsx`, untyped | `.tsx`, **typed** (Deco reads the types) |
| Input shape | `props.data` (nested) | **flattened** top-level props |
| Resolution | by `name` in `home/src/utils/getMappedComponent.js` | by `__resolveType` in `shared/src/utils/resolveSection.ts` |
| Editor | none | Deco builds a form from `Props` + JSDoc |

### Authoring a section

- File: `shared/src/sections/<Name>.tsx` (subfolders allowed, e.g. `Banners/`).
- MUST `export interface Props` **and** `export default` the component. `Props` is the
  contract Deco reads -- annotate fields with JSDoc (`@title`, `@description`, `@format`)
  to drive the admin form. Export sub-interfaces for nested arrays (e.g. `CategoryTab`,
  `BannerImage`).
- Props are **flattened, not `props.data`** -- `DecoCMSContentRender` does
  `const { __resolveType, ...props } = section` and spreads them. Destructure with
  defaults: `function Foo({ title, tabs = [] }: Props)`.
- Shared types live in `shared/src/sections/types.ts` (`CmsAction`, `Facet`, `Banner*`).
  Click actions: import `processActions` from `shared/src/services/ResolveCmsActions` and
  type action objects as `CmsAction`.
- **Register it**: add to `SECTION_MAP` in `shared/src/utils/resolveSection.ts`, keyed by
  the `__resolveType` minus `site/sections/` and extension (e.g. `Banners/MultipleImageBanner`).
- Page content lives in `shared/.deco/blocks/pages-Home.json` -- each section is a flat
  object with `__resolveType`. `DecoCMSContentRender` loads a page via `PAGE_LOADERS`
  (static literal `import()` -- one entry per page) and renders each section.

### Dependency injection for sections (TEMPORARY)

Sections needing cart/snackbar (ProductShelf->ProductCard, NewsLetter) do **not** import a
provider directly -- they consume proxy hooks from `shared/src/providers/CmsDependencies`
(`useLocalShoppingCart`, `useSnackBar`). The host app injects the real hooks:
`<DecoCMSContentRender page='Home' useLocalShoppingCart={...} useSnackBar={...} />`, which
exposes them via `CmsDependenciesProvider` (no prop-drilling). Eitri auto-encapsulates
providers under `src/providers/`, so the injected hooks resolve to mounted context.
**Planned evolution:** move provider mounting to each app's `src/providers/__main__.jsx`
(MainProvider) and drop the proxy -- search for `TEMPORARIO` comments.

### Ported infra & conventions

- Infra ported to shared for the sections (TypeScript): `ProductService.getProductsService`,
  `ShelfOfProducts` + `ProductCard` (+ variation swatches, hooks, utils), providers
  `LocalCart`/`SnackBar`, services `CartService`/`CustomerService`/`NavigationService`/
  `ResolveCmsActions`, `utils/price` (`formatPrice`); domain types in `shared/src/types/product.ts`.
- Split by kind: **services / utils / hooks / types -> `.ts`**, **components / sections -> `.tsx`**.
- TS works outside `src/sections/` too (e.g. `DecoCMSContentRender.tsx`), but **imports must
  be explicit** -- Eitri's auto-import (ts-morph) can otherwise collide. Still no `style`
  prop (Tailwind + `width/height` props only).
- Quick syntax check: `npx --no-install esbuild <file> --jsx=automatic`.

### Keeping in sync with the parallel team

The other team keeps evolving the legacy home components. To pull those changes into the
typed sections without overwriting the typing, use `shared/scripts/section-sync/sync.mjs`
(git-based): `status` / `scan` / `diff <key>` / `log <key>` / `bump <key|all>`, with
`--against <ref>` to compare the baseline against a branch (e.g. `origin/feat/...`). Each
section's baseline lives in `manifest.json`.

## Gotchas

- `freigthService.js` is intentionally misspelled in cart and checkout -- match the existing name.
- ProductCard, LocalCart, SnackBar, search components etc. are **duplicated per app** (not always from shared) -- check the local app copy before assuming shared is used.
- Product variation patterns (sibling products linked by a grouping property, SKU-level variations like size) depend on the client's VTEX catalog configuration. See "Product Variation Patterns" above.
- Before `eitri push-version`, always bump `version` in the app's `eitri-app.conf.js` (add `--shared` for the shared app).
- **Eitri CLI >= 1.57.0 requires the `-p`/`--playground` flag: `eitri app start -p`.** Plain `eitri app start` is not enough to pair/serve a device on these versions. Check the installed version first with `eitri --version`.

## Where to Look for Platform (Bifrost/Luminus) Documentation
- **First stop:** invoke the `eitri-bifrost` skill (or `eitri-luminus` / `eitri-coding` skills, as relevant) -- they hold curated reference docs and are auto-triggered for Bifrost/Luminus questions.
- **Official typedoc:** https://cdn.83io.com.br/library/eitri-bifrost/doc/5.1.0/ (root), class pages at `https://cdn.83io.com.br/library/eitri-bifrost/doc/5.1.0/classes/_internal_.<ClassName>.html` -- this is the authoritative source per the `eitri-bifrost` skill; if the installed `eitri-bifrost` version in a module's `eitri-app.conf.js` differs, check whether a matching versioned doc path exists before trusting the pinned `5.1.0` docs verbatim.
- **Ground truth for tricky runtime behavior:** the typedoc's `.d.ts` comments don't always tell the whole story -- some Bifrost methods have internal state/gotchas only visible in the compiled source. When behavior seems off, read the actual installed package instead of guessing:
    *   Type definitions with doc comments: `~/.eitri/<eitri-app-name>/node_modules/.store/eitri-bifrost@<version>-*/node_modules/eitri-bifrost/dist/tsc/src/**/*.d.ts` (e.g. `Bifrost.d.ts`, `service/Navigation.d.ts`, `service/BottomBar.d.ts`).
    *   Compiled implementation (for actual runtime logic, e.g. internal counters): `dist/tsc/src/service/Navigation.js` and siblings.
    *   Example finding from this: `Eitri.navigation.back(steps)` expects a **number**; passing anything else (like a callback) skips straight to the "back 1" branch, and if the app's internal `stackSize` counter is already at 0 (e.g. a screen reached via a bottom-tab deep link, since `replace: true` navigations never increment it), decrementing goes negative and the SDK **closes the app** instead of navigating.
    *   `Eitri.bottomBar.changeTab({ index })` (`service/BottomBar.d.ts`) is the API to sync the native bottom tab bar's highlighted tab with an in-app `navigate()` call -- needed whenever a screen change should also visually switch tabs (e.g. closing "Categorias" back to "Inicio").
- **Tab -> app/route mapping:** the root `app-config.yaml`'s `bottom-tab-view-simulation.eitri-apps` list maps each bottom-tab `index` to an eitri-app slug and init params (e.g. `tabIndex=1&route=Categories` opens the `home` app directly on the `Categories` view). Check it before reasoning about cross-tab navigation or `Eitri.getInitializationInfos()` behavior.

## Agent Roles & Best Practices

### Discovery & Cross-Module Navigation
**Agent:** `Explore`
Use this agent when you need to find something across the entire repository or see how a pattern is implemented in one module before copying it to another.
- *Example:* "Find all places where the 'Add to Cart' button logic is handled."
- *Example:* "Search for existing date formatting utilities in the shared folder."

### Architecture & Cross-Cutting Changes
**Agent:** `Plan`
Use this agent for any task that involves changing code in more than one module, or when modifying files in the `eitri-shopping-template-vtex-deco-shared` directory. It ensures architectural consistency across all apps.
- *Example:* "Update the shared API client to include a new header."
- *Example:* "Refactor the common theme constants used by PDP and Home."

### Core Implementation & Debugging
**Agent:** `claude` (Default) or `general-purpose`
Use these for standard feature development, fixing bugs in a single module, or writing tests. Before writing or editing components/views, check the root **`.aiconfig`** for the allowed `eitri-luminus` components and styling rules (Tailwind/DaisyUI only, no `style` prop).
- *Example:* "Add a new field to the Checkout form."
- *Example:* "Fix the alignment issue on the PDP gallery."

### Quality Assurance & Critical Flows
High-stakes flows like **Checkout**, **Cart Operations**, and **Account Security** should always be verified end-to-end before opening a PR. The preferred way is running/writing **Maestro** E2E flows on a real device (see below); fall back to manually driving the flow with `claude`/`general-purpose` (run the app, exercise the flow, confirm the UI matches the underlying state) only when no device is available.
- *Example:* "Manually confirm that adding an item to the cart updates the total price in the shared state."

### E2E Validation with Maestro
UI E2E tests run with **Maestro** against the **Eitri Play** shell app (`appId: tech.eitri.play`) on a real Android device via adb -- **preferred**, since it's closer to production behavior (native bottom tab bar, sensors, real performance) and is what's validated in this repo. An Android emulator (AVD) is an accepted fallback when no physical device is available. Flows live in `.maestro/flows/*.yml` (registered by `.maestro/config.yaml`); full setup/run docs in `docs/maestro.md`.
- **Prerequisite:** device connected (`adb devices` must list it; Wi-Fi: `adb connect <ip>:<port>`) and Eitri Play paired with the workspace -- `eitri app start` + QR pairing for dev (`eitri app start -p` on CLI >= 1.57.0 -- see Gotchas), or published app versions.
- **Emulator fallback:** boot an AVD (Android Studio or `emulator -avd <name>`), confirm it shows up in `adb devices` (e.g. `emulator-5554`), then use the same `maestro test` commands below. Prefer a real device whenever one is available.
- **Run:** `maestro test .maestro/flows/<flow>.yml` for one flow, `maestro test .maestro/` for all, `maestro test .maestro/ --include-tags smoke` for the smoke suite. With multiple devices, add `--device <serial>`.
- **Prefer the Maestro MCP tools** when available: `list_devices` -> `inspect_screen` -> `run` (inline YAML is fine for exploration). The `eitri-coding` plugin's `tools/android.py` (OCR-based `screenshot`/`tap_text`/`tap_template`) complements it for **exploration only** -- it's the way to derive coordinates for icon-only targets and to cross-check what the user actually sees against the accessibility tree. It never goes inside a flow.
- **The text matcher is WHOLE-STRING regex (IGNORE_CASE), not substring.** Verified on device: `assertVisible: "Run Eitri"` fails while `"Run Eitri-App"` and `"Run Eitri.*"` pass. Never write a partial string and expect a match; use an explicit regex for interpolated text (e.g. `"Deseja remover .* da sacola\\?"`).
- **WebView gotcha:** app content *is* exposed in the accessibility tree as real text nodes (that's why text selectors work), but `<input>` **placeholders are not** -- wait on a genuinely rendered `Text` instead and tap the field by `point`. Always `inspect_screen` before writing asserts, and re-inspect after UI changes; never author a string from a screenshot.
- **Dev launcher gotcha:** Eitri Play opens on its dev launcher -- all flows delegate this to `.maestro/subflows/bootstrap.yml`. "Run Eitri-App" is an accordion (collapsed, the slug field doesn't exist in the tree), the slug `EditText` is only exposed **when it has text** (so the point tap is mandatory), and its value **persists** between runs (so `eraseText` is mandatory). Apps launched this way run **without the native bottom tab bar** -- assert on screen content (e.g. "Categorias"), never on tab titles like "Inicio".
- **Cart state persists between runs** (`clearState: false` doesn't touch the VTEX orderForm). Don't write flows that tolerate both states -- establish the precondition with `subflows/clear-cart.yml` (Cartman easter egg -> "Limpar carrinho"), then prove it by asserting the header badge equals `"1"` after adding exactly one item.
- Reusable steps live in `.maestro/subflows/` -- outside the `flows/*.yml` glob, so they're not run as tests. Consume with `runFlow: { file: ../subflows/<x>.yml, env: {...} }`.
- When a change touches a critical flow (cart/checkout/account), run the relevant flows before PRing; add a new flow under `.maestro/flows/` if the scenario isn't covered yet.

### Monitoring & Observability
**Agent:** `pup` agents
Use these for any tasks related to Datadog, including log analysis, metric queries, and dashboard management.
- **Logs**: Use `pup:logs`.
- **Metrics/Dashboards**: Use `pup:metrics` or `pup:dashboards`.
- **Error Tracking**: Use `pup:error-tracking`.
- **Complex Debugging**: Combine `pup:logs` and `pup:traces` for investigating state transitions in the checkout or cart flows.

## Workflow Recommendations
1. **Explore First**: If you are unsure how a feature is implemented, use `Explore` to find existing examples in other modules.
2. **Plan Shared Changes**: Never modify the `eitri-shopping-template-vtex-deco-shared` folder without a `Plan` agent assessment first.
3. **Registry Awareness**: When creating new sections for the CMS, check `eitri-shopping-template-vtex-deco-shared/src/sections` for the existing pattern -- it's currently the only module with a `sections` folder.
4. **Follow `.aiconfig`**: Before writing any UI code, check the root `.aiconfig` for the allowed component set and styling rules.
5. **Verify Checkouts**: Always run a checkout/cart end-to-end check before PRing any change that touches those flows -- preferably via Maestro flows on a real device (see "E2E Validation with Maestro"), manually otherwise.
