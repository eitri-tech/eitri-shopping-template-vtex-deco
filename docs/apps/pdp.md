# PDP App (eitri-shopping-template-vtex-deco-pdp)

Product Detail Page mini-app of the Eitri workspace. React web app rendered in a mobile WebView, built with `eitri-luminus` UI components and `eitri-bifrost` for native bridge/navigation. Backend is VTEX, accessed through the shared `eitri-shopping-vtex-shared` library (`Vtex.*` APIs). Single view: `src/views/Home.jsx`.

Manifest: `eitri-app.conf.js` — slug `eitri-shopping-template-vtex-deco-pdp`, version `0.1.9`, depends on shared Eitri apps `eitri-shopping-template-vtex-deco-shared` (0.1.7) and `eitri-shopping-vtex-shared` (1.15.4), plus `i18n`.

---

## 1. Purpose & entry points

The app is opened by other apps in the workspace via `Eitri.nativeNavigation.open({ slug: 'pdp', initParams: {...} })` (see this app's own `src/services/NavigationService.js:openProduct` for the same pattern used for sibling navigation).

Initialization params read in `Home.jsx:startHome()` via `Eitri.getInitializationInfos()`:

| Param | Behavior |
|---|---|
| `product` | Full product object passed directly by the caller (awaited: `await startParams.product`, so it may be a promise). Rendered immediately, before config load. |
| `productId` | Fallback: fetched with `getProductById` (`Vtex.searchGraphql.product`, identifier field `id`). |
| `slug` | Fallback: fetched with `getProductBySlug` (identifier field `slug`). |
| `orderFormId` | Persisted via `saveCartIdOnStorage` (`Vtex.cart.saveCartIdOnStorage`) before the cart is loaded. |

EAN lookup exists (`getProductByEan` in `src/services/productService.js`) but is only used by the `QRCodeScanner` component, which is not mounted in the current view (legacy, see section 9).

`startHome()` sequence (`src/views/Home.jsx:41`):

1. `setIsLoading(true)`; if `startParams.product` exists → `setProduct`, `setCurrentSku(findAvailableSKU(product))`, stop loading (fast path).
2. `loadConfigs()` → `startConfigure()` → `App.tryAutoConfigure()` (`src/services/AppService.js`); sets `configLoaded` (gates Freight/RelatedProducts/Header cart).
3. If no product yet → `loadProduct(startParams)` by `productId` or `slug`.
4. With product in hand: set state again and `loadSiblings(product)` — gets the grouping code via shared `getAgrupadorCode(product)` and calls `getProductSiblingsService(code)` (product sibling variants).
5. `loadCart(startParams)` → saves `orderFormId` if given, then `startCart()` from the `LocalCart` provider.
6. Analytics + history: `TrackingService.sendScreenView(product?.linkText, 'HomePdp')`, `TrackingService.viewItemEvent(product)`, `markLastViewedProduct(product)`.

`findAvailableSKU(product)` (`Home.jsx:73`) picks the first item where any seller has `commertialOffer.AvailableQuantity > 0`, else `product.items[0]`.

An `Eitri.navigation.setOnResumeListener` re-runs `startCart()` whenever the app resumes (e.g., returning from cart).

## 2. View composition

Render tree of `Home.jsx` (inside `<Page title={product?.linkText}>`):

```
Header                              (always; cart badge from LocalCart)
Loading fullScreen                  (while isLoading)
{product && (
  View
    ImageGallery                    (currentSku)
    View (mt-4 px-4)
      MainDescription               (product, currentSku, configLoaded)
      SkuSelector                   (currentSku, product, onSkuChange)
      MaterialSwatches              (currentProductId, siblings, onSwatchPress=openProduct)
    View (px-4 mt-4)
      {/* RichContent — commented out */}
      DescriptionComponent          (product)
    {configLoaded && <Freight currentSku={currentSku} />}
    {configLoaded && <RelatedProducts product={product} />}
  ActionButton                      (product, currentSku)
  BottomInset                       (shared, safe-area spacer)
)}
```

`onSkuChange(newDesiredVariations)` (`Home.jsx:122`) resolves the raw item from `product.items` by `itemId` and sets `currentSku`; a `null`/unmatched argument is silently ignored.

## 3. Components

All paths relative to `eitri-shopping-template-vtex-deco-pdp/src/components/`.

### ImageGallery (`ImageGallery/ImageGallery.jsx`) — in use
Props: `currentSku`. Main image (`pinchZoom`, `zoomMaxScale={8}`, `fadeIn={300}`, `width='100vw'`) plus a horizontal thumbnail strip (thumbnail size `calc((100vw - 28px) / 4)`), shown only when the SKU has >1 image. Selected index resets to 0 on `currentSku.itemId` change; `safeIndex = Math.min(selectedIndex, images.length - 1)` guards against out-of-range after SKU switch. Returns `null` without images.

### ImageCarousel (`ImageCarousel/ImageCarousel.jsx`) — NOT mounted (replaced by ImageGallery)
Props: `currentSku`. keen-slider based (`Slider` from shared) with loop mode, inline pagination dots (`w-[36px]`/`w-[12px]`, `bg-primary`/`bg-base-300`). Measures slide 0 height after image fade (`setTimeout` of `IMAGE_FADE_TIME + 100`ms reading `#keen-slider__slide-0.offsetHeight`) to fix `minHeight` and avoid layout jumps. Contains a stray `"` at the end of the dot className template string.

### SkuSelector (`SkuSelector/SkuSelector.jsx`) — in use
Props: `product`, `currentSku`, `onSkuChange`.
- Builds a normalized `skus` memo from `product.items`: `{ itemId, available, attributes }` where `available = sellerDefault.commertialOffer.AvailableQuantity > 0` and `attributes` is a map of variation name → first value, skipping names listed in `RemoteConfig.getContent('appConfigs.pdp.hiddenVariations')`. SKUs with zero attributes are filtered out; if none remain the component renders `null` (products without variations show no selector).
- `attributeKeys` come from the first SKU. One row of chips is rendered per attribute (e.g. size, color -- the specific variation names depend on the client's catalog).
- `selections` state is synced from `currentSku.variations` in a `useEffect`; `handleSelect(key, value)` merges the new value, resolves an exact SKU via `findSelectedSku` (requires all attribute keys selected), and calls `onSkuChange(newSku)` — state updates round-trip through Home's `currentSku`.
- Availability logic: `getOptionStatus(skus, attributeKeys, key, selections)` computes per value `{ exists, availableExists }` against SKUs matching all *other* current selections. `OptionChip` renders: inexistent → opacity-20 + not clickable; unavailable-but-existing → grayed with a diagonal strike line; selected → primary border/background.
- Values are ordered with `sortSku` (section 6). For a variation named `cor` (case-insensitive) the chip also shows the first image of an item carrying that value; a `COR_MAP`/`ColorSwatch` (round color swatch with hex map for Azul/Vermelho/etc.) exists in the file but is never rendered.

### MaterialSwatches (`MaterialSwatches/MaterialSwatches.jsx`) — in use (sibling product variants)
Props: `currentProductId`, `siblings`, `onSwatchPress` (Home passes `openProduct`).
- Renders `null` unless `siblings` is an array with >=2 entries (a product alone in its group shows nothing).
- Renders up to **two** rows of variation dimensions (e.g. material, secondary attribute), each only when that dimension has >=2 distinct values. If both rows would be hidden the component returns `null`.
- Each option is a `w-8 h-8` `<Image>` thumbnail from curated variation images. (An older hex-swatch implementation in `shared/src/utils/metalSwatches.js` is no longer what this component renders.)
- Current product gets `border-primary`; tapping a non-current swatch calls `onSwatchPress(sibling)` -> opens a new PDP instance with the full sibling product as init param. Because each variation combination is a separate product, the representative chosen for an option is the sibling matching the current selection in the *other* dimension.
- **E2E caveat:** the swatches carry no text, `alt` or accessibility label, and the selection is signalled only by a CSS class — so they are not addressable by Maestro's text matcher.
- The home app has a compact variant (`eitri-shopping-template-vtex-deco-home/src/components/ProductCard/MetalSwatches.jsx`, `w-4 h-4`, max 2 + `+N` overflow); the PDP version shows all siblings.

### MainDescription (`MainDescription/MainDescription.jsx`) — in use
Props: `product`, `currentSku`, plus optional `locale`/`currency` (Home passes `configLoaded`, which the component does not read).
- Price block from `currentSku`'s default seller (`sellerDefault` or first): `commertialOffer.Price` vs `ListPrice`; when discounted shows strike-through list price and `Math.round((1 - price/listPrice) * 100)`% off badge.
- `discoverInstallments(item)`: takes the installment plan with the highest `NumberOfInstallments` from the default seller; returns `''` for 1x; appends "sem juros" when `InterestRate === 0`. Called twice in render (condition + display).
- Easter egg (`copyCheckoutId`): a `useRef` counter starts at 5; each tap on the product name decrements it, and the 6th tap copies `product.productId` to the clipboard via `Eitri.clipboard.setText`, then resets the counter.

### ActionButton (`ActionButton/ActionButton.jsx`) — in use
Props: `product`, `currentSku`. Fixed bottom bar (`fixed bottom-0 z-[999] bg-white`) with a shared `CustomButton` ("Adicionar à Sacola", `h-[60px]`, `rounded-none`) plus a 77px in-flow spacer and `BottomInset`.
- Availability derived per `currentSku` change: default seller's `commertialOffer.AvailableQuantity > 0`; button disabled otherwise.
- `addOrIncreaseCartItem()`: if `currentSku.itemId` already in `cart.items` → `changeItemQuantity(index, qty + 1)`, else `addItem({ ...currentSku, quantity: 1 })` (both from LocalCart provider). Then `TrackingService.addToCartEvent(product)` and a success snackbar. There is no "go to cart" redirect (`openCart` is imported but unused).

### Freight (`Freight/Freight.jsx`) — in use (only when `configLoaded`)
Props: `currentSku`.
- On mount, `loadPostalCodeFromStorage()` (`Vtex.customer.getCustomerData('postalCode')`) restores a saved ZIP and immediately runs the simulation.
- `handleFreight(zipCode)` → `fetchFreight(zipCode, currentSku)` (`src/services/freightService.js`), stores results, flips `pristine`, and persists the ZIP via `savePostalCodeOnStorage` (`Vtex.customer.setCustomerData('postalCode', ...)`).
- Service flow: `Vtex.checkout.resolveZipCode(zipCode)` → address; builds a 1-item simulation payload (`{ id: itemId, quantity: '1', seller: sellerDefault.sellerId }` + `country`/`postalCode`/`geoCoordinates`) → `Vtex.cart.simulateCart`; returns `[]` when a `cannotBeDelivered` message is present; otherwise passes items + `logisticsInfo` through the shared `shippingResolver`, yielding `{ options: [...] }` with `formatedPrice`, `formattedShippingEstimate`, `shippingEstimateDate`, `isPickupInPoint`, `pickupStoreInfo`.
- Rendering: masked ZIP input (`99999-999`) with clear button; "Não sei meu CEP" opens the Correios ZIP lookup site via `Eitri.openBrowser`. Results split into delivery options (sorted by `shippingEstimateDate` ascending, first one tagged "Mais rápida") and pickup options (store `friendlyName` + state/street). Empty result set shows the `freight.errorUnavailable` message. Results fade/slide in via a `requestAnimationFrame`-driven transition.

### Description / Information (`Description/`)
- `DescriptionComponent.jsx` (mounted): wraps `Description` + `Information`.
- `Description.jsx`: `CollapseWrapper` titled "Sobre o produto", expanded by default, rendering `product.description` via `HTMLRender`.
- `Information.jsx`: `CollapseWrapper` titled "Detalhes técnicos", collapsed by default. `buildSpecifications(product)` returns `product.properties` filtered by `App.configs.appConfigs.pdp.hiddenProperties`; a fallback branch for Intelligent Search-shaped products reads `specificationGroups` → `allSpecifications`, but it fills an array with string keys and returns `[result]`, so it only works correctly for the `properties` path.
- `components/CollapseWrapper.jsx`: title row + inline chevron SVGs, `collapsed` state seeded from `defaultCollapsed` via effect, children rendered only when expanded.
- `Supplier.jsx`: standalone collapsible "Fornecedor" block — not mounted anywhere.

### RelatedProducts (`RelatedProducts/RelatedProducts.jsx`) — in use (only when `configLoaded`)
Props: `product`. On product change calls `getWhoSawAlsoSaw(productId)` (`Vtex.searchGraphql.productRecommendations`, `type: 'view'`), filters to products with at least one available SKU, and renders a horizontal scroll of `ProductCard`s (`w-[50vw]`) under the title "Quem viu esta, viu também:". Shows three skeleton blocks while loading; renders `null` when empty and not loading.

### ProductCard (`ProductCard/ProductCard.jsx` + `productCard.hooks.js` + `productCard.utils.js`)
Container/presenter split: the container computes props and renders the shared `ProductCardFullImage` via `React.createElement`.
- Item selection: first item with an available seller, else `items[0]`; `sellerDefault` = flagged seller or first. Invalid product → `null`.
- `productData` memo: name, first image, `video` (`getProductVideo`: reads the property named by `App.configs.appConfigs.productCard.productVideoTag`), price as `Math.min(Price, spotPrice)`, `listPrice` via `getFormattedListPrice` (empty when equal), discount %, `installments` via `formatInstallments` (max interest-free plan, empty for 1x).
- `useCartItem(cart, itemId)` (hooks): memo returning the matching cart line (`{ ...item, index }`) or `null`.
- `useWishlist(productId)` (hooks): checks membership on mount (`productOnWishlist`), exposes `toggle(itemName, itemId)` with optimistic updates calling `addToWishlist`/`removeItemFromWishlist`. The card additionally subscribes to `EventBus` broadcast channels `addToWishlist`/`removeFromWishlist` to stay in sync with other cards/apps.
- Badges: `getBadgesForProducts(product, item, Vtex, 'badges')` from shared (async, on mount). A local `calculateBadge` (cluster `4392` → "retire em 2h", teaser "compre e ganhe" → "leve+ pague-") exists in `productCard.utils.js` but is unused.
- Add-to-cart: products with >1 SKU navigate to their PDP instead of adding directly; otherwise `addItem` + `TrackingService.addToCartEvent` + snackbar; card press → `openProduct(product)`.
- Note: `productCard.hooks.js` imports from `'../../services/CustomerService'` while the file on disk is `customerService.js` — a case mismatch tolerated by the bundler's resolution but wrong on case-sensitive lookups.

### Wishlist (`Wishlist/Wishlist.jsx`) — NOT mounted
Props: `product`, `configLoaded`. Heart toggle (react-icons `FiHeart`/`FaHeart`) with optimistic add/remove through `customerService` (`addToWishlist` forces login via `requestLogin`, which opens the `account` app with `action: 'RequestLogin'` and resolves on resume). Presumably intended for the header; currently `Header` renders only return + cart.

### Share (`Share/Share.jsx`) — NOT mounted
Props: `product`. Builds `${Vtex.configs.host}/${product.linkText}/p?utm_source=eitri-shop-source`, shares via `Eitri.share.link`, fires `TrackingService.shareEvent(product.linkText)`.

### Rating (`Rating/RatingComponent.jsx`) — NOT mounted
Props: `rating` (`{ rating, count }`), `composition` (`[{ _id: 1..5, count }]`). Renders shared `Rating` stars, review count, and per-star percentage bars. No review data source is wired anywhere in the app (`ProductCard` hardcodes `rating = null`).

### Quantity (`Quantity/Quantity.jsx`) — NOT mounted
Props: `quantity`, `handleItemQuantity(delta)`, `disable`. Minus/plus stepper; minus is inert at quantity 1.

### Header (`Header/Header.jsx`) — in use
Uses shared `HeaderContentWrapper` + `HeaderReturn` + `HeaderCart` (badge from `useLocalShoppingCart().cart`). Receives `product`/`configLoaded` from Home but ignores them; contains an unused `handleSearch` that would open the home app's Search route.

### Other unmounted components
`BottomFixed`, `ElasticDots`, `ProductCarousel`, `RichContent` (commented out in Home), `ShelfOfProducts` (+`ShelfOfProductsCarousel`, `ProductCardLoading`), `SearchInput` (+`SearchHistory`, `TopSearches`, `QRCodeScanner`). These are copies from the home/search flow kept in the tree but unreachable from `Home.jsx`. `QRCodeScanner` scans `qr_code`/`ean_13`, resolves products by EAN (`getProductByEan`) and navigates via `openProduct`.

## 4. Services (`src/services/`)

| File | Exports | VTEX / platform APIs |
|---|---|---|
| `AppService.js` | `startConfigure` | `App.tryAutoConfigure({ verbose: false, gaVerbose: false })` |
| `productService.js` | `getProductById`, `getProductBySlug`, `getProductByEan` | `Vtex.searchGraphql.product` (identifier `id`/`slug`/`ean`) |
| | `getWhoSawAlsoSaw` | `Vtex.searchGraphql.productRecommendations` (`type: 'view'`) |
| | `getProductSiblingsService` | `Vtex.searchGraphql.productSearch` with `selectedFacets: [{ key: '<grouping-facet>', value }]`, `from: 0, to: 19`, `hideUnavailableItems: true`, `options.allowRedirect: false` |
| | `markLastViewedProduct` | `Eitri.sharedStorage` key `last-seen-products`, MRU list capped at 14 entries |
| | `showTogether`, `autocompleteSuggestions` | `Vtex.catalog.showTogether`, `Vtex.catalog.autoCompleteSuggestions` (unused by the view) |
| `cartService.js` | `getCart`, `addItemToCart`, `removeCartItem`, `changeItemQuantity`, `saveCartIdOnStorage` | `Vtex.cart.getCurrentOrCreateCart` / `addItem` / `removeItem` / `changeItemQuantity` / `saveCartIdOnStorage` |
| `customerService.js` | `requestLogin`, `isLoggedIn` | `Vtex.customer.isLoggedIn`; opens `account` app for login, resolves on resume |
| | `productOnWishlist`, `addToWishlist`, `removeItemFromWishlist` | `Vtex.wishlist.checkItem` / `addItem` / `removeItem` (add requires login) |
| | `savePostalCodeOnStorage`, `loadPostalCodeFromStorage` | `Vtex.customer.setCustomerData/getCustomerData('postalCode')` |
| `freightService.js` | default `fetchFreight(zipCode, currentSku)` | `Vtex.checkout.resolveZipCode` → `Vtex.cart.simulateCart` → shared `shippingResolver` |
| `NavigationService.js` | `openCart`, `openProduct` | `Eitri.nativeNavigation.open` to slugs `cart` (with `orderFormId`) and `pdp` (with full `product`) |
| `CmsService.js` | `hasLandingPageToSeller` | `Vtex.cms.getPagesByContentTypes(faststore, 'landingPage', ...)` (unused by the view) |
| `SearchMetadataService.js` | `getTopSearches`, `saveSearchHistory`, `getSearchHistory`, `deleteHistory` | `Vtex.catalog.topSearches`, `Eitri.storage` key `search-history` (used only by the unmounted search components) |

## 5. Providers & state (`src/providers/`)

There is no explicit provider wiring in app code; Eitri's build wraps views with the providers found in `src/providers/` by convention.

- **LocalCart** (`LocalCart.jsx`): context exposing `cart`, `cartIsLoading`, `setCart`, `startCart`, `addItem`, `removeItem`, `changeItemQuantity`. All mutations funnel through `executeCartOperation` (loading flag + set new cart when the service returns one). Consumed via `useLocalShoppingCart()` by Home, Header, ActionButton, ProductCard.
- **SnackBar** (`SnackBar.jsx`): context exposing `showSnackBar(type, message)` with types `success` (check icon) and `trash`. Fixed toast at `bottom-[70px] z-[9900]`, fades in after 200ms, auto-closes after 4s. Note: the icon background uses a dynamic class `bg-${currentType?.color}` (`success-500`/`urgent-500`), which Tailwind cannot statically generate — the color strip depends on those classes existing elsewhere.

## 6. Utils (`src/utils/`)

- **utils.js** — grab-bag shared with the other apps. Relevant here: `formatPrice(price, locale?, currency?)` (locale/currency from `App.configs.storePreferences`, defaults pt-BR/BRL), `formatAmount`, `formatAmountInCents` (0 → "Grátis"), `calculateDiscount`, `validateZipCode` (8 digits), `formatZipCode`, `addDaysToDate` (business-day aware), plus `formatProductFromVtex` (see section 7) and a dev-only `openNativeProduct` hack keyed on `window.__WORKSPACE_USER_ID`. Several exports (`hideCreditCardNumber`, `formatDocument`, `parseJwt`, ...) are unused in this app.
- **skuSort.js** — `sortSku(values)` orders variation values by `getOrder`: letter sizes `PP < P < M < G < GG < XG < EG` (1–7); `G1..Gn` → `10+n`; pure numbers ≤20 → `50+n`; larger numbers → `100+n`; `6M`/`10A` kids sizes → `200+`/`220+`; anything else falls back to `9999 + charCode`. Numeric size values sort ascending across the ≤20 (bucket 50+) and >20 (bucket 100+) ranges. Wrapped in try/catch returning the input on failure.

## 7. Data shapes

**Product**: the app works directly on the raw VTEX Intelligent Search GraphQL product — it is NOT normalized. Fields relied upon: `productId`, `productName`, `linkText`, `brand`, `description`, `properties[] ({ name, values[] })`, `items[]` (SKUs). Each item: `itemId`, `name`, `variations[] ({ name, values[] })`, `images[] ({ imageUrl })`, `sellers[]` with `sellerDefault` flag and `commertialOffer { Price, ListPrice, spotPrice, AvailableQuantity, Installments[] ({ NumberOfInstallments, Value, InterestRate }), teasers }`.

`formatProductFromVtex` in `utils.js` produces a flattened shape (`sellers[].price/listPrice/isAvailable/displayedPrice`, `mainImage`, `mainSeller`, precomputed `installments`) but **no code in this app calls it** — components read `commertialOffer` directly. It exists for parity with the other apps.

**SKU variation vs sibling** (key distinction for catalogs using product grouping):
- A *SKU variation* lives inside one product: `items[].variations` (e.g. size, color). Handled by `SkuSelector`.
- A *sibling* is a **separate product** (its own `productId`) representing a variant of the same item (e.g. different material, color family, or configuration). Siblings are linked by a shared product property (default: `Codigo Agrupador`, facet `codigo-agrupador` in Intelligent Search -- adapt to the client's catalog). `getProductSiblingsService` fetches the whole group (the result includes the current product itself). Handled by `MaterialSwatches`; tapping one opens a new PDP.

## 8. Analytics

All through shared `TrackingService` (`eitri-shopping-template-vtex-deco-shared/src/services/TrackingService.js`), which fans out to GA4 (`sendRecommendedGaEvent`) and Insider via `Eitri.exposedApis`:

| Trigger | Call | Events |
|---|---|---|
| `startHome()` after product load | `sendScreenView(linkText, 'HomePdp')` | Firebase screen view (`Eitri.exposedApis.fb.currentScreen`) |
| `startHome()` | `viewItemEvent(product)` | GA4 `view_item` (currency BRL, value, items[]) + Insider `visitProductDetailPage` |
| ActionButton / ProductCard add-to-cart | `addToCartEvent(product)` | GA4 `add_to_cart` + Insider `itemAddedToCart` |
| Share component (unmounted) | `shareEvent(linkText)` | GA4 `share` with `item_id` |

Product metadata for GA/Insider is resolved inside TrackingService (`_resolveGAProductMetadata` / `_resolveInsiderProductMetadata`).

## 9. Gotchas / conventions

- **Auto-globals**: `useState`/`useEffect`/`useRef`/`createContext`/`useContext` and luminus components (`View`, `Text`, `Page`, `Image`, `HTMLRender`) are used without imports in most files — the Eitri build injects them. Some files import them explicitly anyway; both styles coexist.
- **Two product-loading paths**: when the caller passes the full `product` in initParams the page renders before configs load; `setProduct`/`setCurrentSku` then run a second time after `loadConfigs()`. Siblings are loaded only in the second pass.
- **`currentSku` shape mismatch risk**: `SkuSelector.handleSelect` emits its internal `{ itemId, available, attributes }` object; Home re-resolves the real item by `itemId`, so a partial selection (no exact SKU) is a no-op — chips won't visually change until a full valid combination exists.
- **Dead/legacy code is extensive**: `ImageCarousel`, `Wishlist`, `Share`, `Rating`, `Quantity`, `Supplier`, `BottomFixed`, `ElasticDots`, `ProductCarousel`, `RichContent`, `ShelfOfProducts*`, `SearchInput`/`SearchHistory`/`TopSearches`/`QRCodeScanner`, `CmsService`, `SearchMetadataService`, `formatProductFromVtex`, `calculateBadge`, `COR_MAP`/`ColorSwatch` are all unreferenced from the mounted view. Don't assume presence in the tree means it ships.
- **Case-sensitive import bug latent**: `productCard.hooks.js` imports `'../../services/CustomerService'`; the file is `customerService.js`.
- **MaterialSwatches has no disambiguation** when two siblings share the same primary variation (differ only by the secondary variation) — both squares get the same visual. Known sibling-variant caveat.
- **Sibling fetch is per-PDP** (1 extra `productSearch` per page view) with a hard cap of 20 results (`to: 19`); `hideUnavailableItems: true` means fully unavailable siblings never show a swatch.
- **Easter egg**: 6 taps on the product title copy the `productId` to the clipboard (`MainDescription.copyCheckoutId`).
- **Freight ZIP persistence** goes through `Vtex.customer.setCustomerData('postalCode')`, shared across the workspace apps, and auto-triggers a simulation on mount — a slow simulate call can fire before the user touches the form.
- **ActionButton never navigates to cart**; it only adds/increments and shows a snackbar. Cart access is via the header icon.
- **`Information.jsx` fallback branch is broken** for Intelligent Search `specificationGroups` shapes (assigns to string keys of an array and returns `[result]` whose entries lack `name`/`values`); it works because `product.properties` is always present in the GraphQL responses used here.
- **Stray trailing `"`** inside a className template string in `ImageCarousel.jsx:64` (harmless, component unmounted).
- Header's `product`/`configLoaded` props and its `handleSearch` are unused; the console.log `'Eitri.getInitializationInfos()'` in `Home.jsx:32` is leftover debug output, as are logs in `SkuSelector.ColorSwatch` and `customerService.loadPostalCodeFromStorage`.
