# Shared Library (eitri-shopping-template-vtex-deco-shared)

Shared component/service/util library for the Eitri workspace. It is itself an Eitri app (`type: "module"`, `sharedVersion: "v2"`) whose public surface is the barrel file `src/export.js`. Consumed by the `home`, `pdp`, `cart`, `checkout` and `account` apps.

Source root: `eitri-shopping-template-vtex-deco-shared/`

---

## 1. Purpose & usage

Consumer apps declare the library in their own `eitri-app.conf.js` under `eitri-app-dependencies`, flagged as a shared Eitri app and pinned to a version:

```js
"eitri-app-dependencies": {
  "eitri-shopping-template-vtex-deco-shared": {
    "isEitriAppShared": true,
    "version": "0.1.7"
  },
  ...
}
```

They then import by package name:

```js
import { HeaderContentWrapper, TrackingService, getAgrupadorCode } from 'eitri-shopping-template-vtex-deco-shared'
```

**Rule: anything meant to be consumed by other apps must be exported from `src/export.js`.** Files not re-exported there (e.g. `src/utils/utils.js`, `src/utils/constants.js`) are internal to the library.

The shared app has its own dependencies (`eitri-app.conf.js`): `eitri-luminus 2.22.6`, `eitri-bifrost 5.4.0`, `eitri-commons 2.2.1`, plus shared-app dependencies `eitri-shopping-vtex-shared 1.15.4` (used by `SkuSelector` for `RemoteConfig`) and `i18n 14.1.2`.

---

## 2. Complete export inventory (`src/export.js`)

| Export name | Source file | Kind |
|---|---|---|
| `HeaderCart` | `src/components/Header/HeaderCart.jsx` | component |
| `HeaderLogo` | `src/components/Header/HeaderLogo.jsx` | component |
| `HeaderMenu` | `src/components/Header/HeaderMenu.jsx` | component |
| `HeaderSearch` | `src/components/Header/HeaderSearch.jsx` | component |
| `HeaderReturn` | `src/components/Header/HeaderReturn.jsx` | component |
| `HeaderText` | `src/components/Header/HeaderText.jsx` | component |
| `CustomButton` | `src/components/CustomButton/CustomButton.jsx` | component |
| `CustomInput` | `src/components/CustomInput/CustomInput.jsx` | component |
| `CustomCheckbox` | `src/components/CustomCheckbox/CustomCheckbox.jsx` | component |
| `HeaderContentWrapper` | `src/components/Header/HeaderContentWrapper.jsx` | component |
| `HeaderSearchIcon` | `src/components/Header/HeaderSearchIcon.jsx` | component |
| `HeaderWishList` | `src/components/Header/HeaderWishList.jsx` | component |
| `HeaderShare` | `src/components/Header/HeaderShare.jsx` | component |
| `Loading` | `src/components/Loading/LoadingComponent.jsx` | component |
| `Spacing` | `src/components/Spacing/Spacing.jsx` | component |
| `Divisor` | `src/components/Divisor/Divisor.jsx` | component |
| `ProductCardDefault` | `src/components/ProductCard/ProductCardDefault.jsx` | component |
| `ProductCardFullImage` | `src/components/ProductCard/ProductCardFullImage.jsx` | component |
| `GenericError` | `src/components/Error/GenericError.jsx` | component |
| `cartShippingResolver` | `src/utils/cartShippingResolver.js` | util |
| `shippingResolver` | `src/utils/shippingResolver.js` | util |
| `productGroupShippingResolver` | `src/utils/productGroupShippingResolver.js` | util |
| `TrackingService` | `src/services/TrackingService.js` | service |
| `Datadog` | `src/services/Datadog.js` | service |
| `NewsletterService` | `src/services/NewsletterService.js` | service |
| `BottomInset` | `src/components/BottomInset/BottomInset.jsx` | component |
| `CustomCarousel` | `src/components/CustomCarousel/CustomCarousel.jsx` | component |
| `LoginModal` | `src/components/LoginModal/LoginModal.jsx` | component |
| `Rating` | `src/components/ProductCard/components/Rating.jsx` | component |
| `GenericBox` | `src/components/GenericBox/GenericBox.jsx` | component |
| `Slider` | `src/Slider/Slider.jsx` | component |
| `SkuSelector` | `src/components/SkuSelector/SkuSelector.jsx` | component |
| `getBadgesForProducts` | `src/services/BadgesService.js` | service |
| `SliderPagination` | `src/components/SliderPagination/SliderPagination.jsx` | component |
| `getProductProperty` | `src/utils/metalSwatches.js` | util |
| `getAgrupadorCode` | `src/utils/metalSwatches.js` | util |
| `getMetalColor` | `src/utils/metalSwatches.js` | util |
| `groupSiblingsByCode` | `src/utils/metalSwatches.js` | util |

Internal only (present in the repo, NOT in `export.js`): `BadgeRender`, `WishlistIcon`, `HeaderFilter`, `HeaderOffset`, `src/utils/utils.js`, `src/utils/constants.js`, `src/utils/skuSort.js`, `src/utils/getRemoteConfigStyleProperty.js`, `src/services/TrackingService_old.js`, `src/sections/*`, `src/views/Home.jsx`.

---

## 3. Components in depth

### Header blocks (`src/components/Header/`)

Headers are composed by consumer apps: `HeaderContentWrapper` is the fixed shell, the other `Header*` components are its children.

- **`HeaderContentWrapper.jsx`** — props: `children`, `variant` (`HEADER_VARIANT.FIXED` default | `INLINE` | `SCROLL_SOLID`), `scrollEffect`, `scrollEffectMaxTranslate`, `blurOnScroll`, `hideAfterViewportHeights` (default `3.5`), `height`, `className`, `containerClassName`, `...rest`.
  - `FIXED` (default, unchanged behavior): renders a `fixed top-0 z-[9900]` bar with `backdrop-blur-sm bg-header-background`, a top safe-area inset (`<View topInset='auto' />`), the content row (`min-h-[60px] px-4 gap-3`), then a `HeaderOffset` to push page content below the header. With `scrollEffect` it hides on scroll-down / shows on scroll-up via a `requestAnimationFrame`-throttled scroll handler (`translateY(-100%)` by default, overridable via `scrollEffectMaxTranslate`); the effect can be globally disabled through remote config `headerScrollEffect`. Header height is tracked with a `ResizeObserver` on `#header`. All position/background/blur changes animate via `transition-all duration-500 ease-in-out` for a smooth effect.
    - `blurOnScroll` swaps the solid background for a transparent-first behavior: the header starts fully transparent at the top of the page, gains a soft `backdrop-blur-md bg-header-background/40` once the user scrolls past a small threshold (~24px) away from the top, and — combined with `scrollEffect` — fully hides (`translateY`) after scrolling down `hideAfterViewportHeights` screens' worth of content. Scrolling back up instantly clears the blur and re-reveals the header, mirroring the down behavior.
  - `INLINE`: no `fixed` positioning, no background/shadow/blur, no `HeaderOffset` — content sits in the normal document flow, blending with the page instead of a separate white bar. Currently not used by any call site (kept as an option for headers that should never re-appear on scroll). `scrollEffect` is ignored in this mode.
  - `SCROLL_SOLID`: `position: sticky` instead of `fixed` (no `HeaderOffset` needed, no layout jump). Starts without background/shadow/blur; a `<View id='header-sentinel' />` rendered just above it is tracked via `IntersectionObserver` — once it scrolls out of the viewport, the header "solidifies" (gains `bg-header-background`/`shadow-md`/`backdrop-blur-sm`) while staying sticky at the top. Used by `Categories`, `ProductCatalog`, `Search` (no banner above them, but long lists still benefit from a reachable header once scrolling starts). `scrollEffect` is ignored in this mode.
- **`HeaderOffset.jsx`** (internal) — spacer that mirrors the real `#header-container` height via `ResizeObserver`; prop `topInset` adds another safe-area inset.
- **`HeaderCart.jsx`** — props: `quantityOfItems`, `onClick`, `cart`. Inline shopping-bag SVG (`text-header-content`); when `cart` is passed it recomputes the badge from `cart.items` quantities. Badge is a `bg-header-content` circle with the count. Default click (no `onClick`): `Eitri.nativeNavigation.open({ slug: 'cart' })`.
- **`HeaderLogo.jsx`** — props: `src`. Falls back to remote config `headerLogo` (via `getRemoteAppConfigProperty`); renders nothing until a URL resolves. Constrained to `max-h-[40px] max-w-[150px]`.
- **`HeaderReturn.jsx`** — props: `backPage`, `onClick`, `className`. Chevron-left SVG; `onClick` wins, otherwise `Eitri.navigation.back(backPage)` / `Eitri.navigation.back()`.
- **`HeaderText.jsx`** — prop: `text`. `text-header-content text-xl font-bold line-clamp-1`.
- **`HeaderSearch.jsx`** — props: `onPress`, `labelSearch`. Fake search input (rounded pill, magnifier SVG, placeholder text default `'Procurar...'`). **Note: `onPress` is destructured but never attached** — consumers must wrap it in a clickable container.
- **`HeaderSearchIcon.jsx`** — prop: `onClick`. `react-icons` `FiSearch`, size 24, `text-header-content`.
- **`HeaderWishList.jsx`** — props: `filled`, `className`, `onClick`. Thin clickable wrapper around internal `WishlistIcon`.
- **`HeaderShare.jsx`** — props: `onClick`, `className`. Inline share-nodes SVG, default `text-header-content`.
- **`HeaderMenu.jsx`** — props: `iconColor`, `content`, `showDrawer`, `onCloseDrawer`, `onPressOpenButton`. Hamburger icon plus an 80vw slide-in drawer with dark backdrop; uses legacy prop-style luminus API (`position`, `customColor`, `opacity`...) instead of Tailwind classes, and delays drawer opacity 2s to avoid flicker. `onPressOpenButton` and `iconColor` are unused.
- **`HeaderFilter.jsx`** (internal, not exported) — filter funnel SVG with a `bg-primary-700` dot when `hasFilters` is true; `handleFilterModal`/`facetsModalReady` props are not wired.

**`HEADER_TYPE` (`src/utils/constants.js`)** — enumeration of intended header layouts: `TEXT`, `RETURN_AND_TEXT`, `LOGO_SEARCH_AND_CART`, `RETURN_SEARCH_AND_CART`, `TEXT_AND_SEARCH_ICON`, `SEARCH_AND_CART`, `RETURN_TEXT_FILTER_AND_SEARCH_ICON`, `SEARCH_INPUT_AND_FILTER`, `RETURN_SHARE_AND_CART`. Currently **not exported and not referenced by any consumer app** — layouts are composed manually with the blocks above. `constants.js` also defines `DIMENSIONS.HEADER_HEIGHT = 70`, used as `HeaderContentWrapper`'s default height.

### Product cards

- **`ProductCardDefault.jsx`** — props: `listPrice`, `image`, `name`, `price`, `width` (unused), `installments`, `loadingCartOp`, `loadingWishlistOp` (unused), `isOnWishlist`, `showListItem` (unused), `actionLabel`, `badge` (commented out), `onPressOnCard`, `onPressCartButton`, `onPressOnWishlist` (accepted but never wired), `className`. White rounded card with drop shadow, fixed 160px `object-contain` image, 3-line name clamp, strikethrough list price, `text-primary-700` price, installments, and a full-width pill CTA button (`bg-primary-700`) showing `actionLabel` or a `Loading` spinner. Card click is handled by an absolute full-card overlay `View` at the end.
- **`ProductCardFullImage.jsx`** — props: `listPrice`, `image`, `name`, `price`, `installments`, `loadingCartOp`, `isOnWishlist`, `itemQuantity` (unused), `badges`, `showListItem`, `showWishlist = true`, `cartIcon`, `onPressOnCard`, `onPressMainAction`, `onPressOnWishlist`, `swatches`, `className`. Differences vs Default:
  - Edge-to-edge `object-cover` image whose height is computed from remote config `appConfigs.productCardImageAspectRatio` (e.g. `3:4`); default height is `window.innerWidth / 2 * 4/3`. The VTEX image URL is resized by rewriting `/ids/{id}/` to `/ids/{id}-{w}-{h}/` unless `appConfigs.productCardImageAvoidResize` is set.
  - Renders `badges` via `BadgeRender` (top-left), a wishlist button (top-right, `stopPropagation`), and a main-action icon bottom-right (`cartIcon` slot or default shopping-bag SVG, `Loading` while `loadingCartOp`).
  - `showListItem` actually gates the list-price row (in Default it is ignored).
  - `swatches` is a render slot below installments — used by the home/pdp apps for product variation swatches.
  - Whole card is clickable (`onClick={onPressOnCard}` on the root), no overlay trick.
- **`Rating.jsx`** (`src/components/ProductCard/components/Rating.jsx`) — props: `ratingValue`, `ratingsCount`. 5 `FaStar` icons with fractional fill via a clipped overlay (`width: fillPercentage%`), gray base + `#F2C832` fill; when `ratingsCount != null` it appends `ratingValue.toFixed(1)` (the count itself is never displayed).

### `SkuSelector` (`src/components/SkuSelector/SkuSelector.jsx`)

Props: `product` (VTEX product with `items[].variations`), `currentSku`, `onSkuChange`.

- Builds a normalized SKU list (`itemId`, `available` from default seller `AvailableQuantity`, `attributes` map from `variations`), dropping variation names listed in remote config `appConfigs.pdp.hiddenVariations` (read via `RemoteConfig.getContent` from `eitri-shopping-vtex-shared`).
- `selections` state is seeded from `currentSku.variations`. Per attribute it renders `OptionChip`s; `getOptionStatus` computes `{exists, availableExists}` for each value given the other selections — non-existent combos get `opacity-20 cursor-not-allowed`, existing-but-unavailable get a strike-through line. Values are ordered by `sortSku` (see `skuSort.js`).
- For the attribute named `cor` (case-insensitive) the chip also shows the first image of a matching SKU.
- Selecting a value calls `onSkuChange(newSku)` where `newSku` is the SKU matching all selections (or `null` if incomplete). Renders `null` when there are no attribute keys.
- Contains an unused `ColorSwatch` component and `COR_MAP` hex table (Azul/Vermelho/Verde/... ) — dead code, never rendered.

### Form primitives

- **`CustomButton.jsx`** — props: `disabled`, `variant`/`outlined`, `label`, `onPress` and/or `onClick` (both called), `isLoading`, `borderRadius` (className, default `rounded-lg`), `height` (className, default `h-[45px]`), `className`, `children` (replaces everything incl. spinner), `leftIcon`, `...rest`; `color`, `backgroundColor`, `width` are destructured but unused. Solid mode: `bg-primary` / `text-primary-content`, gray when disabled/loading; outlined mode: transparent + `border-primary` + `text-primary`. Shows shared `Loading` when `isLoading`.
- **`CustomInput.jsx`** — props: `icon` (unused), `type`, `label`, `onChange`, `value`, `className`, `onFocus`, `error`, `...rest` (spread onto `TextInput`). On focus it registers an `Eitri.keyboard` visibility listener and `scrollIntoView({block:'center'})` so the field isn't hidden by the soft keyboard. `type='password'` gets an inline eye/eye-off SVG toggle. `error` renders a red helper line.
- **`CustomCheckbox.jsx`** — props: `checked`, `onChange`, `label`, `align`, `justify`. Luminus `Checkbox` (`checkbox-primary`) plus clickable label that also toggles.

### Sliders

- **`Slider.jsx` (`src/Slider/Slider.jsx`)** — thin wrapper around a **vendored KeenSlider React build** (`src/Slider/keenslider/react.es.js`, ~960-line minified ES module; no npm dependency). Props: `options` (passed straight to `useKeenSlider` — e.g. `slides.perView`, `loop`, `rtl`, `vertical`), `autoPlay`, `autoPlayTimeout` (default 5000 ms), `plugins`, `children`. When `autoPlay` is set it pushes an autoplay plugin onto the `plugins` array (note: mutates the caller's array) that calls `slider.next()` on a timer, cleared on `dragStarted` and re-armed on `created`/`animationEnded`/`updated` (the `mouseOver` guard exists but nothing ever sets it). Each child gets the `keen-slider__slide` class and slide styles injected via `cloneElement`. Renders a raw `<div>` (one of the few non-luminus elements in the codebase).
- **`SliderPagination.jsx`** — props: `count`, `activeIndex`, `className`. **Renders nothing when `count <= 1`.** Dot row (`flex justify-center items-center gap-1`); active dot is `w-[24px] bg-black`, inactive `w-[6px] bg-base-300`, all `h-[6px] rounded-full` with `transition-[width,background-color] duration-300 ease-in-out`. Used by home-app `SliderHero`, `ShelfOfProductsSlider`, `ShelfOfProductsCarousel`.
- **`CustomCarousel.jsx`** — hand-rolled (non-Keen) carousel. Props: `children`, `autoPlay = false`, `interval = 3000`, `loop = true`, `onSlideChange(next, prev)`. Full-width slides, touch + mouse drag with a 50px threshold, `translateX` transform with drag offset, autoplay paused while dragging. No pagination built in.

### Other components

- **`LoginModal.jsx`** — props: `open`, `onClose`, `onLoginWithPassword({email, password})`, `onRequestOtp({email})`, `onLoginWithOtp({email, otpCode})`, `onRegisterClick`, `isLoading`, `initialMode = 'password'`. Bottom-sheet modal (`fixed inset-0 z-[9999] bg-black/70`, content `items-end`), with a password/OTP mode toggle, built from `CustomInput`/`CustomButton`, backdrop click closes, `BottomInset` at the end. All auth logic is delegated to the callbacks; state resets when `open`/`initialMode` change.
- **`LoadingComponent.jsx`** (exported as `Loading`) — props: `isLoading`, `fullScreen`. Returns `null` only when `isLoading` is explicitly `false` (undefined renders the spinner). `fullScreen` renders a `fixed inset-0 z-[999]` dimmed overlay with `loading-lg`; otherwise an inline luminus `Loading` (`text-primary`). Despite the `src/assets/animations/*.json` Lottie files, this component uses the luminus/DaisyUI spinner, **not Lottie** (see §6).
- **`BadgeRender.jsx`** (internal) — props: `badges`, `className`, `imageClassName = 'w-[40px]'`. For each badge renders `badge.image` as an `Image`, else `badge.textBadge.text` in a pill styled with inline `badge.textBadge.bgColor` / `badge.textBadge.textColor`. Returns `null` for empty input. Missing React `key` in the map.
- **`WishlistIcon.jsx`** (internal) — props: `filled`, `className`, `size` (default 26). `MdFavorite` / `MdFavoriteBorder` from react-icons, default `text-primary`.
- **`GenericBox.jsx`** — props: `children`, `className`, `...rest`. White rounded card: `bg-white rounded-lg shadow-[0_4px_4px_0_rgba(0,0,0,0.078)] p-4 w-full`.
- **`GenericError.jsx`** — prop: `onRetryPress`. Full-screen error state ("Não foi possível continuar") with TENTAR NOVAMENTE / CANCELAR (`Eitri.navigation.backToTop()`), plus current date/time (America/Sao_Paulo) and the app slug from `Eitri.getConfigs()`. Note: `getConfigs()` is called in the render body, not inside `useEffect`.
- **`Spacing.jsx`** — props: `height` (default `50`), `width` (default `full`). Emits `h-${height} w-${width}` — dynamic Tailwind class names, so only values that appear elsewhere in the safelist/build actually resolve.
- **`Divisor.jsx`** — no props; `w-full h-[1px] bg-primary` line.
- **`BottomInset.jsx`** — no props; `<View bottomInset='auto' className='w-full' />` safe-area spacer for notched devices.

---

## 4. Services in depth

### `TrackingService` (`src/services/TrackingService.js`)

Static-only class. All GA4 events go through `sendRecommendedGaEvent(eventName, data)` → `Eitri.exposedApis.fb.logEvent`; Insider events go through `Eitri.exposedApis.insider.*`. `_logInTerminal` is a debug logger hard-disabled by `TURNED_ON = false`.

Private helpers: `_resolveCategory(item)` (builds `item_category`..`item_categoryN` from cart-item category paths), `_resolveInsiderProductMetadata(product)` and `_resolveGAProductMetadata(product)` (pick the first SKU with stock and its default seller for pricing), `_resolveGACartItemMetadata(item)` (orderForm item → GA item, price = `priceDefinition.calculatedSellingPrice / 100`).

| Method | GA4 event | Insider event | Notes |
|---|---|---|---|
| `sendScreenView(name, file)` | — (Firebase `currentScreen`) | — | `Eitri.exposedApis.fb.currentScreen` |
| `insiderVisitHomepage()` | — | `visitHomepage` | |
| `sendRecommendedGaEvent(name, data)` | any | — | generic passthrough |
| `adImpressionEvent(data)` | `ad_impression` | — | |
| `addPaymentInfoEvent(cart, paymentType?)` | `add_payment_info` | — | derives payment name from orderForm `paymentData` when omitted |
| `addShippingInfoEvent(cart)` | `add_shipping_info` | — | `shipping_tier` = unique selected SLAs joined with `;` |
| `addToCartEvent(product)` | `add_to_cart` | `itemAddedToCart` | |
| `addToWishlistEvent(data)` | `add_to_wishlist` | — | |
| `beginCheckoutEvent(cart)` | `begin_checkout` | — | includes `coupon` |
| `loginEvent(method)` | `login` | `signUpConfirmation` | |
| `purchaseEvent(cart, orderId)` | `purchase` | `itemPurchased` (one per cart item, `saleID = orderFormId`) | `transaction_id = orderId`, shipping totalizer / 100 |
| `removeFromCartEvent(cart, index)` | `remove_from_cart` | `itemRemovedFromCart` | |
| `searchEvent(term)` | `search` | — | |
| `selectContentEvent(data)` | `select_content` | — | |
| `selectItemEvent(data)` | `select_item` | — | |
| `selectPromotionEvent(data)` | `select_promotion` | — | |
| `shareEvent(itemId)` | `share` | — | |
| `signUpEvent(data)` | `sign_up` | — | |
| `viewCartEvent(cart)` | `view_cart` | `visitCartPage` (products array, price / 100) | |
| `viewItemEvent(product)` | `view_item` | `visitProductDetailPage` | |
| `viewItemListEvent(data)` | `view_item_list` | — | |
| `viewPromotionEvent(data)` | `view_promotion` | — | |
| `viewSearchResultsEvent(data)` | `view_search_results` | — | |

### `Datadog` (`src/services/Datadog.js`)

Three static loggers, all POSTing to **`https://api.eitri.tech/analytics/event`** with header `application-id: window.__eitriAppConf.applicationId`:

- `sendDatadogWarningLog(data, method)` — `origin: 'APP-SHOPPING-WARNING'`
- `sendDatadogInfoLog(data, method)` — `origin: 'APP-SHOPPING-INFO'`
- `sendDatadogLogError(error, method, data)` — `origin: 'APP-SHOPPING-ERROR'`; also attaches `Eitri.device.getInfos()` and a serialized error (`message`, `stack`, `name`).

Every payload carries `eventName = appConf.slug` plus `application`, `slug`, `applicationId`, `version`, `method`. When `Eitri.environment.getName() === 'dev'` the payload is only `console.log`ged, never sent.

### `NewsletterService` (`src/services/NewsletterService.js`)

Store newsletter signup, 3-step flow against VTEX workspaces (base URLs are store-specific, configured as `MID_BASE` and `RCK_BASE` constants in the service):

1. `isEmailSubscribed(email)` — `GET {MID}/_v/newsletter?email=...`; 2xx = already subscribed, 404/rejection = not subscribed.
2. `POST {RCK}/_v/register-leads-mkt-cloud` — Marketing Cloud lead `{ name, email, termsAndConditions, creation_date: 'YYYY-MM-DD', page }` (default page `lead_newsletter_footer`); expects 201.
3. `PATCH {MID}/_v/newsletter` — VTEX master-data write `{ email, firstName, termsofuse: true }`; expects 204.

`subscribeToNewsletter({ name, email, acceptedTerms, page })` validates required fields, short-circuits with `{ success: true, alreadySubscribed: true }`, otherwise runs steps 2–3 and returns `{ success: true, alreadySubscribed: false }`. Default export is the object `{ subscribeToNewsletter, isEmailSubscribed }`.

### `getBadgesForProducts` (`src/services/BadgesService.js`)

`getBadgesForProducts(product, currentSku, VtexContext, contentType)` returns a deduplicated badge array from two sources:

1. **Teaser parsing** — iterates `currentSku.sellers[sellerDefault].commertialOffer.teasers` and matches "leve X por R$ Y (cada)" patterns via `parsePromo()`; matched promos produce `{ text, color: '#8b153f', bgColor: '#ffffff' }`. (No guard: throws if `teasers` is undefined.)
2. **CMS flags** — `getCmsContent(Vtex, contentType)` fetches VTEX FastStore CMS pages via `Vtex.cms.getPagesByContentTypes(faststore, contentType)` (`loadVtexCmsPage`), flattens page sections and keeps only sections named `Badges` or `Flags` that are inside their `startDate`/`endDate` window. Section `data.type` matching: `product` (productId in `values`), `category` (categoryTree id match), `collection` (productClusters id match).

Caching is two-layer: an in-memory promise dedupe (`promiseHolder[contentType]`, one fetch per content type per session) and a persisted `Eitri.sharedStorage` cache keyed by `contentType` with a **24 h TTL** (`loadPageFromCache`/`savePageInCache`). Cache hits are served immediately while a background refresh updates storage (stale-while-revalidate).

---

## 5. Utils in depth

### Shipping resolvers (all take a VTEX orderForm/cart, all return `null` when `shippingData.logisticsInfo` is missing)

- **`shippingResolver(cart)`** (`src/utils/shippingResolver.js`) — pipeline: `flattenSlas` (all SLAs across all `logisticsInfo` items, tagged with `itemIndex`/`addressId`) → `groupSlasByType` (Map keyed by SLA id, summing `price` and collecting per-item `{itemIndex, selectedSla, selectedDeliveryChannel}`) → `enrichShippingOptions` (adds `formatedPrice`, `fulfillsAllItems`, resolved `deliveryAddress` or pickup `businessHours`, and `products` from cart items) → `extractCurrentSlas` (currently-selected SLA per item, merged by SLA id). Returns `{ options, current, addressOk }` where `addressOk` is true when every logistics item has a `selectedSla`. Used for the shipping-selection UI.
- **`cartShippingResolver(cart)`** (`src/utils/cartShippingResolver.js`) — computes "cheapest" vs "fastest" delivery. `preProcessingSla` normalizes every SLA (estimated date from `shippingEstimate` string via `addDaysToDate`, `selected` flag, courier/warehouse/dock ids); returns `[]` if any item has zero SLAs. `mapFasterAndCheaperShippingOption` marks per item `isFaster`/`isCheaper` (ties broken by price/date; pickup SLAs excluded). Output: `{ postalCode, shippingAvailable, selectedAddresses, address, options }` where `options` are labeled `'Entrega econômica'` / `'Entrega mais rápida'` (collapsed into one when they coincide) plus one option per pickup point (`isPickupInPoint`, `formatedPickAddress`). The sentinel date `01/02/1970` renders `'Indiponível para entrega'` (typo in source).
- **`productGroupShippingResolver(cart)`** (`src/utils/productGroupShippingResolver.js`) — groups cart items whose SLA sets are identical (`createSlaKey` = sorted SLA ids joined with `|`), summing per-SLA `totalPrice` across items and attaching item info (`name`, `quantity`, `imageUrl`). `enrichShippingGroups` adds `currentSla` (empty string when items in the group diverge), `formatedShippingEstimate` (via `formatShippingEstimate`) and `formattedTotalPrice`. Used for "delivery groups" display.

### `utils.js` (internal; feeds the resolvers)

`formatAmountInCents(amount)` (BRL, `0` → `'Grátis'`), `formatDate(date)` (pt-BR), `addDaysToDate(days, onlyBusinessDays=true)` (skips weekends, normalizes to 12:00), `addHoursToDate(h)`, `addMinutesToDate(m)`, `getShippingEstimate(sla)` (parses VTEX `shippingEstimate` strings: `m` minutes, `h` hours, `bd` business days, plain number = calendar days), `formatShippingEstimate(sla)` (human strings: pickup → "Retire em X horas/minutos", "Retire amanhã", "Retire até {weekday}, {day} de {month}"; delivery → "Receba amanhã" / "Receba até ...", switching phrasing above 7 days).

### `metalSwatches.js` (product sibling variants)

- `getProductProperty(product, propertyName)` — first value of the matching `product.properties[]` entry, **`null`** (not `''`) when missing.
- `getAgrupadorCode(product)` — `getProductProperty(product, 'Codigo Agrupador')`; the code that links sibling variant products (which are separate VTEX products, not SKUs). **Adapt the property name for each client's catalog.**
- `getMetalColor(material)` — regex-ordered color map for variation values; returns hex colors. Default `#C0C0C0`. **Customize the map for each client's variation values.**
- `groupSiblingsByCode(products)` — `{ [agrupadorCode]: product[] }`, skipping products without a code; `{}` for non-arrays.

Consumers: home `ProductCatalogContent.jsx`, `MetalSwatches.jsx`, `SearchResults.jsx`; pdp `Home.jsx`, `MaterialSwatches.jsx`.

### `skuSort.js` (internal, used by `SkuSelector`)

`sortSku(values)` sorts size labels: letter sizes `PP < P < M < G < GG < XG < EG` (1–7), `G1/G2/...` (10+n), small numbers ≤ 20 (50+n), adult numbers (100+n), kids `6M` months (200+n) / `10A` years (220+n), anything else alphabetical at 9999+. Wrapped in try/catch returning input on failure.

### `getRemoteConfigStyleProperty.js` (internal)

Despite the filename, exports **`getRemoteAppConfigProperty(property)`**: reads `Eitri.environment.getRemoteConfigs().appConfigs[property]`. Used by `HeaderLogo` (`headerLogo`) and `HeaderContentWrapper` (`headerScrollEffect`).

### `constants.js` (internal)

`HEADER_TYPE` (see §3) and `DIMENSIONS = { HEADER_HEIGHT: 70 }`.

---

## 6. Assets & locales

- **`src/assets/animations/loading.json`, `loading-inline.json`** — Lottie animation JSONs. **Currently unreferenced** in shared source; `LoadingComponent` uses the eitri-luminus `Loading` spinner instead. They appear to be leftovers from an earlier Lottie-based loader.
- **`src/components/ProductCard/assets/`** — `addCartIcon.svg`, `addIcon.svg`, `removeIcon.svg`, `trashIcon.svg`; not imported by the current card components (icons are inlined as JSX SVGs).
- **`src/locales/pt-BR/translation.json`, `src/locales/en-US/translation.json`** — both are **empty objects `{}`**. The i18n dependency (14.1.2) is declared, but the shared library ships no translations; all user-facing strings are hardcoded pt-BR in components (`'Procurar...'`, `'Entrar na conta'`, `'Grátis'`, etc.).

---

## 7. Versioning & deployment

- Version lives in `eitri-app.conf.js`: currently **`"version": "0.1.7"`**, with `sharedVersion: "v2"`.
- Publish with `eitri push-version --shared` (workspace CI in `bitbucket-pipelines.yml` / `check_and_push.js` handles pushes).
- Each consumer pins an explicit version and must be bumped manually. **Pins are currently mismatched:**

| Consumer app | Pinned shared version |
|---|---|
| `eitri-shopping-template-vtex-deco-home` | 0.1.7 |
| `eitri-shopping-template-vtex-deco-pdp` | 0.1.7 |
| `eitri-shopping-template-vtex-deco-cart` | 0.1.3 |
| `eitri-shopping-template-vtex-deco-checkout` | 0.1.3 |
| `eitri-shopping-template-vtex-deco-account` | 0.1.3 |

  cart/checkout/account therefore do not see anything added after 0.1.3 (including the metalSwatches utils and `SliderPagination`) until their pins are bumped.
- The shared app itself pins `eitri-shopping-vtex-shared: 1.15.4` — the same version pinned by all consumers, which should be kept in sync.

---

## 8. Gotchas

- **`TrackingService_old.js`** (433 lines) still ships in `src/services/` but is not exported and not imported anywhere in shared. It contains the legacy event API (`sendEitriTracking`, `screenView`, `addItemToCart`, `inngageEvent`, `appsFlyerEvent`, ...). The account app has its own local `TrackingService.js` whose catch message still says `'Error on TrackingService_old.screenView'` — a copy/paste relic.
- **Scaffold leftovers**: `src/views/Home.jsx` (empty `<Page topInset>`), `src/sections/Banners/Hero.tsx` and `src/sections/Post.tsx` (deco.cx-style TSX sections) are unused and unexported.
- **`HeaderSearch` `onPress` is dead** — the prop is destructured but never bound; wrap the component in a clickable `View` in the consumer.
- **`HeaderMenu`** uses the legacy prop-based luminus styling API (`position='fixed'`, `customColor`, `opacity`) unlike every other component (Tailwind classes); `onPressOpenButton`/`iconColor` props are ignored.
- **`ProductCardDefault` `onPressOnWishlist` is never wired** — the wishlist icon is display-only there; only `ProductCardFullImage` handles the click.
- **`BadgesService` teaser badge shape mismatch**: teaser badges are pushed as `{ text, color, bgColor }`, but `BadgeRender` expects `{ image }` or `{ textBadge: { text, bgColor, textColor } }` — teaser badges need adaptation by the consumer before rendering with `BadgeRender`. Also `getBadgesForProducts` throws if the default seller has no `teasers` array.
- **`SkuSelector` dead code**: `ColorSwatch` + `COR_MAP` are defined but never rendered (color values render as `OptionChip` with an image instead).
- **`Slider` mutates the `plugins` prop array** when `autoPlay` is on (pushes into the caller's array on every render), and its autoplay `mouseOver` guard is vestigial.
- **`Spacing` builds dynamic Tailwind classes** (`h-${height}`), which only work for values already present in the compiled CSS.
- **`GenericError` calls `getConfigs()` in the render body** (not `useEffect`), triggering repeated async calls per render.
- **`HEADER_TYPE` is defined but unused/unexported** — header layouts are hand-composed in each app.
- **Filename mismatch**: `getRemoteConfigStyleProperty.js` exports `getRemoteAppConfigProperty`.
- **`Loading` is not Lottie** despite the bundled Lottie JSONs (see §6); note also the shared `Loading` export shadows the eitri-luminus `Loading` name — imports must be disambiguated when both are needed (as done in `ProductCardFullImage`, which uses the luminus one).
- **`BadgeRender`, `WishlistIcon`, `HeaderFilter`, `HeaderOffset` are internal** — consumers cannot import them; `HeaderWishList` is the public wrapper for the wishlist icon.
