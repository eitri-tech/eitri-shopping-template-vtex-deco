# Home App (eitri-shopping-template-vtex-deco-home)

## 1. Purpose & Entry Points

The storefront app: CMS-driven homepage, full-text product search, faceted catalog (PLP), categories, landing pages, and blog. It's the largest app in the workspace.

**Entry via bottom tabs** (defined in `app-config.yaml`):
- "Inicio" tab (`tabIndex=0`) — opens `Home.jsx`
- "Categorias" tab (`tabIndex=1`, `route=Categories`) — deep-links to `Categories.jsx`

**Deep linking**: `Home.jsx:72-81` checks `Eitri.getInitializationInfos()` for a `route` param and navigates directly via `processDeepLink()`.

**On mount** (`Home.jsx:44-55`): calls `startConfigure()` (VTEX auto-config) then `resolveRedirectAndCartAndCms()` which loads cart, enables CMS query, and sends analytics.

**Resume**: `Eitri.navigation.addOnResumeListener` reloads the cart on every tab re-focus.

## 2. Views

| File | Route | Responsibilities |
|------|-------|-----------------|
| `src/views/Home.jsx` | `/Home` (default) | Loads CMS sections via `useQuery(['cms','home'])`, shows `HomeSkeleton` while loading, renders `MainHeader` + `CmsContentRender`. Requests notification permission. |
| `src/views/Search.jsx` | `/Search` | Text search. Receives optional `searchTerm` via location state. `SearchInput` + `ProductCatalogContent` (infinite scroll PLP). Saves search history. |
| `src/views/ProductCatalog.jsx` | `/ProductCatalog` | Faceted PLP. Receives `params` (facets, query, sort), `title`, optional `banner` image via location state. Shows `HeaderReturn` if not opened in bottom bar. |
| `src/views/Categories.jsx` | `/Categories` | Loads CMS content type `categories` / page name `categorias`. Uses `CmsContentRender` + `setPageTitle` callback (used by `CategoryListVtex` to set dynamic breadcrumb in header). |
| `src/views/LandingPage.jsx` | `/LandingPage` | Dynamic CMS page. Receives `landingPageName` via state, calls `getCmsContent('landingPage', landingPageName)`. |
| `src/views/Error.jsx` | `/Error` | Generic error with `GenericError` (shared) and "go home" button. |
| `src/views/Cartman.jsx` | `/Cartman` | Debug tool — shows cart ID, items, buttons: generate new cart, add random item, clear cart. Hidden from normal navigation (accessed via easter egg countdown in `utils.js:goToCartman`). |

## 3. CMS Rendering Pipeline

### Flow

```
getCmsContent(contentType, pageName)          // src/services/CmsService.js
  -> Vtex.cms.getPagesByContentTypes(faststore, contentType, { filters[name]: pageName })
  -> date-range filter (isWithinValidDateRange — startDate/endDate per section & per banner image)
  -> Firebase Remote Config filter (filterRemoteConfigContent — sections with remoteConfigKey are hidden if RC returns false)
  -> savePageInCache (Eitri.sharedStorage, key: `${faststore}_${contentType}_${pageName}`, 24h TTL)
  -> returns { sections, settings }
                    |
                    v
CmsContentRender (src/components/CmsContentRender/CmsContentRender.jsx)
  -> maps cmsContent array via getMappedComponent(content, reloadKey, rest)
  -> reloadKey updates on app resume to force child re-renders
                    |
                    v
getMappedComponent (src/utils/getMappedComponent.js)
  -> looks up content.name in componentMap -> renders <Component data={content.data} reloadKey={reloadKey} />
```

### CMS Section Component Map

| CMS Section Name | Component | File | Description |
|-----------------|-----------|------|-------------|
| `MultipleImageBanner` | Banner | `CmsComponents/Banner/Banner.jsx` | Dispatcher by `data.mode`: `SliderHero` (default), `BannerList`, `RoundedBannerList`, `GridList`, `SingleBanner`, `FitOnScreen`. All pass `onClick={processActions}`. Banner images also filtered by date-range and remote config key. |
| `ProductShelf` | ProductShelf | `CmsComponents/ProductShelf/ProductShelf.jsx` | Fetches products via `getProductsService` using `data.facets`, `data.term`, `data.sort`, `data.numberOfItems` (default 8). Renders via `ShelfOfProducts` (mode: `data.mode` or `'scroll'`). |
| `ProductTiles` | ProductTiles | `CmsComponents/ProductTiles/ProductTiles.jsx` | Tabbed product shelves. `data.shelves[]` each with own facets/term/sort. Tab selector at top, products cached by title. Uses `ShelfOfProducts`. |
| `HighlightedProductShelf` | HighlightedProductShelf | `CmsComponents/HighlightedProductShelf/HighlightedProductShelf.jsx` | Featured shelf with custom background/text color, optional countdown timer (`data.showTimer`, `data.endDate`). Hidden when expired. "See more" links to ProductCatalog. |
| `ProductInfiniteScroll` | ProductInfiniteScroll | `CmsComponents/ProductInfiniteScroll/ProductInfiniteScroll.jsx` | Wraps `ProductCatalogContent` inline. Uses `data` directly as params (facets, term, sort). Optional title, optional filter bar. |
| `CategoryTree` | CategoryTree | `CmsComponents/CategoryTree/CategoryTree.jsx` | CMS-defined category shelves. Each shelf has categories with `facets` string. Renders `ListWithImages` (image grid) or `SimpleList` (text-only) based on `shelf.showAsSimpleItem`. |
| `CategoryListSwipe` | CategoryListSwipe | `CmsComponents/CategoryListSwipe/CategoryListSwipe.jsx` | Vertical list of `data.content[]` items with `CategoryPageItem` (image + title + subtitle). Clicks dispatch `processActions`. |
| `CategoryListVtex` | CategoryListVtex | `CmsComponents/CategoryListVtex/CategoryListVtex.jsx` | Fetches live VTEX category tree (`getCategoryTree(10)`), cached in module-level variable. Stack-based drill-down UI with slide animations. Supports `data.exclusionList` (semicolon-separated names/IDs to hide). Sets dynamic page title via `setPageTitle` prop. |
| `CategoryAccordion` | CategoryAccordion | `CmsComponents/CategoryAccordion/CategoryAccordion.jsx` | Collapsible category list. Items may have `subItems[]`. Clicks dispatch `processActions`. Rendered inside `GenericBox`. |
| `CategoryGallery` | CategoryGallery | `CmsComponents/CategoryGallery/CategoryGallery.jsx` | Tabbed gallery (`data.tabs[]` with `label` + `categories[]`). 2-column grid of category images. Tab switch has fade animation. |
| `LastSeenProducts` | LastSeenProducts | `CmsComponents/LastSeenProducts/LastSeenProducts.jsx` | Reads `last-seen-products` from `Eitri.sharedStorage`, fetches up to 8 products by ID. Returns null if empty. |
| `WordPressCardList` | BlogPostShelf | `CmsComponents/Blog/BlogPostShelf.jsx` | Fetches WordPress posts via `data.postUrl/wp-json/wp/v2/posts`. Horizontal carousel of `BlogCard`s. |
| `RichText` | RichText | `CmsComponents/RichText/RichText.jsx` | Renders Draft.js-format JSON content (blocks with inline styles, entity links, lists, blockquotes, code, headers h1-h6). Links open via `Eitri.webFlow.start`. |
| `VtexAdsBanner` | VtexAdsBanner | `CmsComponents/VtexAdsBanner/VtexAdsBanner.jsx` | Sponsored ads from NewTail Media. Fires impression/view/click beacons. Click navigates to ProductCatalog or resolves path. Only renders when `data.isActive` is true. |
| `Experiences` | Experiences | `CmsComponents/Experiences/Experiences.jsx` | 2-column grid of brand experience items. Each has icon (from react-icons map or image URL), title, description. Click dispatches `processActions`. |
| `OverHeader` | OverHeader | `CmsComponents/OverHeader/OverHeader.jsx` | Fixed bottom promotional bar (black background). Shows `data.promotionalText` and optional `data.couponCode` with copy-to-clipboard. |
| `NewsLetter` | NewsLetter | `CmsComponents/NewsLetter/NewsLetter.jsx` | Newsletter signup form. Email + name + terms checkbox. Uses `NewsletterService.subscribeToNewsletter` (shared). Fires `newsletter_subscribe` GA event. |

### CMS Section Schemas

`public/cms/sections.json` (~52KB) defines schemas for all section types — field names, types, defaults, scope restrictions. Used by the VTEX CMS editor, not at runtime.

## 4. Non-CMS Components

| Component | File | Purpose |
|-----------|------|---------|
| **ProductCard** | `src/components/ProductCard/ProductCard.jsx` | Card using `ProductCardFullImage` (shared). Computes available SKU, seller, pricing, discount %. Loads badges via `getBadgesForProducts`. Adds to cart (single SKU) or opens PDP (multi-SKU). Wishlist via EventBus. Renders `MetalSwatches` from siblings. |
| **MetalSwatches** | `src/components/ProductCard/MetalSwatches.jsx` | Shows up to `MAX_VISIBLE=2` colored squares per sibling product variant. Color from `getMetalColor(getProductProperty(sibling, '<variation-property>'))`. Overflow shows `+N`. Click opens PDP for that sibling. |
| **ShelfOfProducts** | `src/components/ShelfOfProducts/ShelfOfProducts.jsx` | Container with title + "See more" link. Delegates to `ShelfOfProductsCarousel` (mode=`'carousel'`) or `ShelfOfProductsSlider` (default). |
| **ProductCatalogContent** | `src/components/ProductCatalogContent/ProductCatalogContent.jsx` | Core PLP component. Manages pagination, infinite scroll, sort, filters. Loads sibling products per page (batches `agrupadorCode` → `getProductSiblingsService` → `groupSiblingsByCode`). Sub-components: `CatalogFilter`, `CatalogSort`, `SearchResults` grid, `InfiniteScroll`. |
| **MainHeader** | `src/components/Header/MainHeader.jsx` | App header with logo, search icon, cart icon (badge), QR scanner. |
| **SearchInput** | `src/components/SearchInput/SearchInput.jsx` | Text input with autocomplete suggestions and back button. |
| **TopSearches** | `src/components/TopSearches/TopSearches.jsx` | Popular terms from `Vtex.catalog.topSearches()`. |
| **SearchHistory** | `src/components/SearchHistory/SearchHistory.jsx` | Recent searches from local storage. |
| **HomeSkeleton** | `src/components/HomeSkeleton/HomeSkeleton.jsx` | Loading placeholder for homepage. |
| **InfiniteScroll** | `src/components/InfiniteScroll/InfiniteScroll.jsx` | Scroll-to-bottom detection wrapper. Calls `onScrollEnd`. |
| **QRCodeScanner** | `src/components/QRCodeScanner/QRCodeScanner.jsx` | Scans EAN → `getProductByEan` → opens PDP. |
| **SectionTitle** | `src/components/SectionTitle/SectionTitle.jsx` | Reusable section heading. |
| **SwiperContent** | `src/components/SwiperContent/SwiperContent.jsx` | Horizontal scroll container with gap/padding options. |

## 5. Services

### `src/services/ProductService.js`

| Export | API | Notes |
|--------|-----|-------|
| `getProductsService(params, page)` | `Vtex.searchGraphql.productSearch` | PAGE_SIZE=12. Params: `fullText`, `selectedFacets`, `orderBy` (via `resolveSortParam`), `from`/`to`, `hideUnavailableItems: true`. |
| `getProductsServiceRest(params, page)` | `Vtex.catalog.getProductsByFacets` | REST fallback (legacy search). |
| `getProductsFacetsService(params)` | `Vtex.searchGraphql.facets` | Returns available filter facets for current query. |
| `getProductsFacetsServiceRest(params)` | `Vtex.catalog.getPossibleFacets` | REST fallback. Formats PRICERANGE facets to BRL labels. |
| `getProductById(productId)` | `Vtex.searchGraphql.product` | `identifier: { field: 'id', value }`. |
| `getCategoryTree(levels)` | `Vtex.catalog.getCategoryTree` | Module-level cache (`cachedCategoryTree`). |
| `getProductByEan(ean)` | `Vtex.searchGraphql.product` | `identifier: { field: 'ean', value }`. |
| `getProductSiblingsService(agrupadorCodes)` | `Vtex.searchGraphql.productSearch` | Product sibling variants. `selectedFacets` with repeated grouping-facet key (VTEX OR's them). `to: 99`. Returns `products[]`. |
| `autocompleteSuggestions(value)` | `Vtex.catalog.autoCompleteSuggestions` | For search autocomplete. |

### `src/services/CmsService.js`

| Export | API | Notes |
|--------|-----|-------|
| `getCmsContent(contentType, pageName)` | `Vtex.cms.getPagesByContentTypes` | Filters sections by date-range and Remote Config. Caches via `Eitri.sharedStorage` (24h). |
| `loadVtexCmsPage(faststore, contentType, pageName)` | (same) | Internal — fetches, filters dates, calls `filterRemoteConfigContent`. |
| `loadPageFromCache` / `savePageInCache` | `Eitri.sharedStorage` | 24h TTL. Key: `${faststore}_${contentType}_${pageName}`. Note: `loadPageFromCache` is defined but `cachedPage` is always null in `getCmsContent` (cache read disabled). |
| `filterRemoteConfigContent(page)` | `Eitri.exposedApis.remoteConfig.getString` | Extracts all `remoteConfigKey` values from sections + banner images, batch-fetches from Firebase Remote Config, removes sections/images where RC returns false. |

### `src/services/CartService.js`

| Export | API |
|--------|-----|
| `getCart()` | `Vtex.cart.getCurrentOrCreateCart` |
| `addItemToCart(skuItem)` | `Vtex.cart.addItem` |
| `removeCartItem(index)` | `Vtex.cart.removeItem` |
| `updateItemOnCart(index, quantity)` | `Vtex.cart.changeItemQuantity` |

### `src/services/CustomerService.js`

| Export | API | Notes |
|--------|-----|-------|
| `requestLogin()` | Opens account app | `slug: 'account', initParams: { action: 'RequestLogin', closeAppAfterLogin: true }`. Returns Promise resolved on resume if logged in. |
| `isLoggedIn()` | `Vtex.customer.isLoggedIn` | |
| `productOnWishlist(productId)` | `Vtex.wishlist.checkItem` | Returns `{ inList, listId }`. |
| `removeItemFromWishlist(id)` | `Vtex.wishlist.removeItem` | |
| `addToWishlist(productId, title, sku)` | `Vtex.wishlist.addItem` | Calls `requestLogin()` first. |

### `src/services/NavigationService.js`

| Export | Purpose |
|--------|---------|
| `openCart()` | `Eitri.nativeNavigation.open({ slug: 'cart' })` |
| `openAccount(action)` | `Eitri.nativeNavigation.open({ slug: 'account', initParams: { action } })` |
| `openProduct(product)` | `Eitri.nativeNavigation.open({ slug: 'pdp', initParams: { product } })` |
| `openProductById(productId)` | Same with `{ productId }`. |
| `openProductBySlug(slug)` | Same with `{ slug }`. |
| `normalizePath(path)` | Parses VTEX URL paths into `{ facets[], query }`. Handles 4 formats: `?q=` search, `filter.<key>=<value>` IS params, `?map=` legacy, `?facets=` format. Ignores keys: `fuzzy`, `operator`, `channel`, `locale`. |
| `resolveNavigation(path, title)` | Calls `normalizePath` then navigates to `ProductCatalog`. |

### `src/services/ResolveCmsActions.js`

`processActions(sliderData)` — dispatches CMS banner/item clicks. Fires `selectPromotionEvent` if `sliderData.mktTag` present.

| Action Type | Handler | Navigation |
|-------------|---------|------------|
| `search` | `handleSearchAction` | → Search view with searchTerm |
| `collection` | `handleCollectionAction` | → ProductCatalog with `productClusterIds` facet + optional extra facets, sort, banner |
| `page` | `handlePageAction` | → LandingPage with `landingPageName` |
| `category` | `handleCategoryAction` | → ProductCatalog with `category-1`, `category-2`… facets from `/`-split path |
| `product` | `handleProductAction` | → PDP by ID (numeric) or slug (string) |
| `path` | `resolveNavigation` | Normalizes arbitrary VTEX path → ProductCatalog |
| `brand` | `openBrand` | → ProductCatalog with `brand` facet |
| `link` | `openLink` | Opens external URL via `Eitri.openBrowser` |
| `facets` | `openFacets` | → ProductCatalog with arbitrary facets + sort |

**Bug**: `case 'facets'` falls through to `default` (missing `break`).

### `src/services/SearchMetadataService.js`

| Export | API/Storage |
|--------|-------------|
| `getTopSearches()` | `Vtex.catalog.topSearches()` |
| `saveSearchHistory(term)` | `Eitri.storage` (`search-history`). Max 5 items, MRU order. |
| `getSearchHistory()` | Reads from `Eitri.storage`. |
| `deleteHistory()` | `Eitri.storage.clear('search-history')`. |

### `src/services/VtexAdsService.js`

| Export | API |
|--------|-----|
| `getSponsoredBanner({ sponsoredPlacement, keyword, size, context, quantity })` | `Eitri.http.post` to NewTail Media RMA endpoint. Publisher ID: `72c5a3e2-853e-449d-afda-fa41d8eb2bec`. Returns `{ adId, imageUrl, destinationUrl, clickUrl, impressionUrl, viewUrl }[]`. |

### `src/services/RemoteConfigService.js`

| Export | API |
|--------|-----|
| `getFbRemoteConfig(key)` | `Eitri.exposedApis.remoteConfig.getString({ key })`. Parses `'true'`/`'false'` to booleans. |

### `src/services/AppService.js`

| Export | API |
|--------|-----|
| `startConfigure()` | `App.tryAutoConfigure({ verbose: false, gaVerbose: false })`. |

### `src/services/helpers/resolveSortParam.js`

Bidirectional sort param converter between CMS format (`orders:desc`) and GraphQL format (`OrderByTopSaleDESC`). Default: `score:desc` / `OrderByScoreDESC`.

## 6. Providers & State

### `src/providers/LocalCart.jsx`

Context: `useLocalShoppingCart()` hook.

| Method | Wraps |
|--------|-------|
| `startCart()` | `getCart` |
| `addItem(payload)` | `addItemToCart` |
| `removeItem(itemId)` | `removeCartItem` |
| `updateItemQuantity(index, quantity)` | `updateItemOnCart` |
| `cart` / `cartIsLoading` / `setCart` | State |

All operations go through `executeCartOperation(operation, ...args)` which sets loading state. On error, returns previous cart state.

**Tab badge**: `updateTabBadge()` updates bottom bar tab index 2 (Sacola) with total item quantity.

**EventBus**: subscribes to `ADD_TO_CART` and `UPDATE_CART_ITEM` (broadcast) to sync cart across apps.

### `src/providers/SnackBar.jsx`

Context: `useSnackBar()` hook.

`showSnackBar(type, message)` — types: `success` (green check) or `trash` (red trash icon). Auto-dismisses at 4s. Fixed bottom toast with slide-up animation.

## 7. Utils

### `src/utils/getMappedComponent.js`

Maps 17 CMS section names to React components (see section 3 table). Returns `<Component key={content.id} data={content.data} reloadKey={reloadKey} {...rest} />` or null if not found.

### `src/utils/Constants.js`

- `PROVIDER`: `{ VTEX, WAKE, DECO }` — only VTEX is used.
- `CMS_PRODUCT_SORT`: 10 sort option mappings (`name_asc` → `OrderByNameASC`, etc.).

### `src/utils/lists.js`

`LIST_ORDERING` — 8 sort options for the catalog sort UI: relevance, best sellers, newest, discounts, highest/lowest price, A-Z/Z-A. Each with `id`, `categoryKey: 'ordering'`, i18n `name`, and `value` (e.g. `'score:desc'`).

### `src/utils/utils.js`

- `formatPrice(price, locale?, currency?)` — BRL locale formatting. Uses `App.configs.storePreferences` for defaults.
- `goToCartman()` — Easter egg: countdown from 10 to 0 on repeated calls, then navigates to Cartman view.

### `src/utils/minimumOrderValue.js`

- `getCartValueInCents(cart)` — Items + Discounts totalizers summed.
- `getMinimumOrderValueInCents(cart)` — Maximum `seller.minimumOrderValue` across all sellers in cart.
- `getMinimumOrderStatus(cart)` — Returns `{ currentValueInCents, minimumValueInCents, missingValueInCents, progress, hasReachedMinimumOrderValue }`.
- `hasReachedMinimumOrderValue(cart)` — Boolean shorthand.

## 8. Cross-App Navigation

| Destination | How |
|-------------|-----|
| PDP | `openProduct(product)` / `openProductById(id)` / `openProductBySlug(slug)` — all via `Eitri.nativeNavigation.open({ slug: 'pdp', initParams })`. |
| Cart | `openCart()` — `Eitri.nativeNavigation.open({ slug: 'cart' })`. |
| Account | `openAccount(action)` / `requestLogin()` — opens account app with `initParams`. Login returns a Promise resolved via `setOnResumeListener`. |
| External links | `Eitri.openBrowser({ url, inApp: true })` via `ResolveCmsActions.openLink`. |

## 9. Analytics & Ads

**TrackingService** (shared): `sendScreenView` on every view mount. `insiderVisitHomepage()` on home load. `searchEvent(term)` on search. `selectPromotionEvent` on banner clicks with `mktTag`. `addToCartEvent` on add-to-cart.

**VtexAdsService**: NewTail Media integration. `VtexAdsBanner` CMS section fires impression beacon on render, view beacon on 50% visibility (IntersectionObserver), click beacon on tap.

## 10. Gotchas

- **CMS cache read disabled**: `CmsService.js:11` — `const cachedPage = null` is hardcoded, so `loadPageFromCache` is never actually used (always fetches fresh + writes to cache, but never reads back).
- **ResolveCmsActions missing break**: `case 'facets':` at line 128 falls through to `default` — logs "Unknown action type" after executing `openFacets`.
- **ProductCatalogContent sibling batching**: codes are accumulated in `fetchedCodesRef` (Set) across pages to avoid re-fetching siblings already loaded. Uses `groupSiblingsByCode` to merge into `siblingsByCode` state.
- **TanStack Query**: Home.jsx uses `@tanstack/react-query` with `useQuery` — the only view using it. CMS loading is deferred via `enabled: enableCmsQuery` until after config + deep link resolution.
- **Notification permission**: requested on every Home mount regardless of user response.
- **CategoryListVtex module-level cache**: `cachedStack` persists across route navigations within the same session. If category tree changes, it won't refresh until app restart.
