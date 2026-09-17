# Cart App (eitri-shopping-template-vtex-deco-cart)

Shopping bag mini-app of the Eitri workspace. React web app rendered in a mobile WebView, built with `eitri-luminus` components (no raw HTML), file-based routing under `src/views/`, VTEX backend via `eitri-shopping-vtex-shared`.

Config (`eitri-app.conf.js`): slug `eitri-shopping-template-vtex-deco-cart`, version `0.1.4`, `eitri-luminus` 2.22.6, `eitri-bifrost` 5.4.0. Shared deps: `eitri-shopping-template-vtex-deco-shared` 0.1.3, `eitri-shopping-vtex-shared` 1.15.4, `i18n` 14.1.2.

## 1. Purpose & entry points

- **Bottom tab "Sacola"**: registered in the workspace `app-config.yaml` (native tabs section) as slug `eitri-shopping-template-vtex-deco-cart`, title `Sacola`, initialization param `tabIndex=2`.
- **Direct open with a cart**: other apps can open it passing `orderFormId` in init params. `Home.loadCart()` reads `Eitri.getInitializationInfos()` and, if `startParams.orderFormId` is present, calls `saveCartIdOnStorage(orderFormId)` (`src/services/cartService.js` → `Vtex.cart.saveCartIdOnStorage`) before `startCart()`.
- **App resume**: `Home` registers `Eitri.navigation.setOnResumeListener(() => startHome())`, so returning to the tab re-runs configuration, cart reload and tracking. `EmptyCart` registers its own resume listener that calls `startCart()` and, if the cart now has items, navigates back to `Home` with `replace: true`.
- **EmptyCart redirect**: a `useEffect` in `Home` watching `cart` navigates to `EmptyCart` (`replace: true`, passing `{ openWithBottomBar }` in state) whenever `cart.items.length === 0`.
- **Tab vs push mode**: `openWithBottomBar` is set from `startParams?.tabIndex` (truthy for `tabIndex=2`). When opened from the tab bar, `HeaderReturn` is hidden and EmptyCart's "Comprar Agora" close button is hidden; when pushed from another app, both show and the button calls `Eitri.navigation.close()`.

## 2. Views

### `src/views/Home.jsx`
- **State**: `appIsLoading` (initial `true`), `openWithBottomBar`.
- **Context**: `cart`, `startCart` from `useLocalShoppingCart()`.
- **Effects**:
  - Mount: `startHome()` + resume listener re-running `startHome()`.
  - `[cart]`: redirect to `EmptyCart` when the cart has zero items (see above).
- **`startHome()`**: reads init infos → sets `openWithBottomBar` → `startConfigure()` (`AppService`) → `loadCart()` → `setAppIsLoading(false)` → `TrackingService.sendScreenView('Carrinho', 'HomeCart')` + `TrackingService.viewCartEvent(cart)`.
- **Render** (inside `<Page title='Carrinho'>`): `HeaderContentWrapper` (`HeaderReturn` conditional + `HeaderText` with `t('home.title')` = "Sacola"), fullscreen `Loading`, and when `cart` is set: `MinimumOrderValue`, `CartItemsContent`, `Freight`, `Coupon`, `CartSummary` in a column, then fixed `ActionButton`. All child sections read the cart from context; none receive cart props.

### `src/views/EmptyCart.jsx`
- Reads `openWithBottomBar` from `props.location.state`.
- **Effects**: mount → `TrackingService.sendScreenView('Carrinho vazio', 'EmptyCart')`; second mount effect installs the resume listener that returns to `Home` when items reappear.
- **Render**: header (same pattern as Home), centered inline `ShoppingBagIcon` SVG component (defined in the same file), texts `emptyCart.txtEmptyCart` / `emptyCart.txtMessageList`, and — only when NOT opened via tab — a `CustomButton` (`emptyCart.labelButton` = "Comprar Agora") that calls `Eitri.navigation.close()`. Ends with `BottomInset`.

## 3. Components (`src/components/`)

| Component | Props | Cart context usage |
|---|---|---|
| `CartItemsContent` | none | `cart`, `changeQuantity`, `removeItem`, `addItemOffer`, `removeItemOffer` |
| `CartItem` | `item`, `onChangeQuantityItem`, `message`, `handleRemoveCartItem`, `onAddOfferingToCart`, `onRemoveOfferingFromCart` | none (all via props) |
| `CartSummary` | none | `cart` |
| `Coupon` | none | `cart`, `addCoupon`, `removeCoupon` |
| `Freight` | none | `cart`, `setLogisticInfo` |
| `MinimumOrderValue` | `fallbackMinimumValueInCents = 0` | `cart` |
| `ActionButton` | none | `cart` |
| `Quantity` | `quantity`, `handleItemQuantity`, `disable` | none |
| `ModalConfirm` | `text`, `showModal`, `removeItem`, `closeModal` | none |
| `InstallmentsMsg` | none (unused component) | `cart` |
| `SaveButton` | `handleSaveFavorite`, `isInWishlist` (unused component) | none |

### CartItemsContent (`CartItemsContent/CartItemsContent.jsx`)
Keeps a local `cartItems` copy (`useEffect` on `[cart]` does `setCartItems([...cart.items])`) so `handleRemoveCartItem(index)` can optimistically splice the item out before awaiting `removeItem(index)`; then fires `TrackingService.removeFromCartEvent(cart, index)`. `hasMessage(itemEan)` filters `cart.messages` for `code === 'withoutStock'` with matching `fields.ean` and passes the first match as the `message` prop. Maps items keyed by `item.uniqueId`, binding each callback to the item index (`onChangeQuantityItem`, `handleRemoveCartItem`, `onAddOfferingToCart`, `onRemoveOfferingFromCart`).

### CartItem (`CartItem/CartItem.jsx`)
- **Image**: rewrites VTEX image URL to a 200px variant: `item.imageUrl.replace(/\/(\d+)-\d+-\d+\//, '/$1-200-auto/')`. Image and name click call `goToProduct()` → `openProduct(item.productId)` (opens PDP app).
- **Availability banner**: when `item.availability !== 'available'`, shows a red box with `cartItem.cannotBeDelivered` (for `availability === 'cannotBeDelivered'`) or `cartItem.notAvailable`.
- **Price**: `formatAmountInCents(item.priceDefinition.total)`.
- **Quantity**: `handleQuantityOfItemsCart(delta)` sets `loadingItemQuantity` and calls `onChangeQuantityItem(item.quantity + delta)`; while loading, the `Quantity` control is replaced by a `Loading` spinner.
- **Wishlist**: on mount `checkWishlist()` calls `checkWishlistItem(item.productId)` (`customerService`) and stores `listId` in `wishlistId`. `handleSaveFavorite()` toggles optimistically: if saved, clears state then `removeItemFromWishlist(wishlistId)`; otherwise sets `wishlistId=true` as a placeholder, calls `addToWishlist(productId, name, sku)` (which forces login via `requestLogin()`), and stores `result.data.addToList`; on error it restores the previous value. Rendered via shared `HeaderWishList` with `filled={!!wishlistId}`.
- **Removal**: the shared `CloseIcon` (a `FiX` from `react-icons/fi`, not `IoCloseSharp`) opens `ModalConfirm` with text `cartItem.txtRemoveCartItem` interpolating the item name; the confirm button reads **`Excluir`** (`modal.confirm.delete`) and calls `handleRemoveCartItem()`. Tapping the backdrop does **not** dismiss — `ModalConfirm.jsx:14-16` calls an `onClose` that is never passed, so it's a silent no-op; only `Cancelar` closes it. The icon has no text or accessibility label, so E2E has to tap it by position (measured at ~(89%, 27%) for the first row on 1080×2400 — see `.maestro/flows/cart-remove-item.yml`).
- **Offerings/bundles**: when `item.offerings.length > 0` and there is no `withoutStock` message, renders one `Toggle` row per offering. `offerIsBundled(offeringId)` checks `item.bundleItems.some(o => o.id === offeringId)`; `handleItemOffer` removes the offering if bundled, adds it otherwise. Price shown with `formatAmountInCents(offering.price)`.
- A block rendering the `message` text is commented out — the `message` prop currently only suppresses the offerings section.

### CartSummary (`CartSummary/CartSummary.jsx`)
Parses `cart.totalizers` on `[cart]` via `getTotalizerById(totalizers, id)` (`find` by `id`): `Items` → `itemsValue`, `Discounts` → `discounts` (negative value). `total = (items?.value ?? 0) + (discounts?.value ?? 0)`. Returns `null` when `total === 0`. Renders Subtotal (if > 0), Desconto (if ≠ 0) and Total rows using `formatAmountInCents`. A `Shipping` row is commented out; the shipping totalizer is intentionally not displayed.

### Coupon (`Coupon/Coupon.jsx`)
State: `coupon` (input), `appliedCoupon`, `invalidCoupon`, `couponTextAlert`, `isLoading`. The `[cart]` effect drives three states:
1. `cart.marketingData.coupon` present → applied: shows the coupon code in a bordered box with a trash-icon remove button; if the typed `coupon` equals the applied one, shows `coupon.txtAppliedCoupon` in success color.
2. Not applied but an entry in `cart.messages` whose `text` includes the typed coupon → invalid: `couponNotFound` → `coupon.txtInvalidCoupon`, `couponExpired` → `coupon.txtExpiredCoupon`; alert rendered with `text-error`.
3. Otherwise resets `invalidCoupon`/`appliedCoupon`.

`onPressAddCoupon` calls provider `addCoupon(coupon)` (fire-and-forget — `isLoading` is set true/false synchronously around the un-awaited call, so it never visibly spins). `onPressRemoveCoupon` clears local state and calls `removeCoupon()` (implemented as `Vtex.checkout.addPromoCode('')`).

### Freight (`Freight/Freight.jsx`)
Not a generic freight calculator — it is the **cannotBeDelivered recovery flow**. Computes `unavailableItems = cart.items.filter(item => item.availability === 'cannotBeDelivered')` and renders `null` when empty. Otherwise shows a yellow warning box: headline `freight.unavailableWithZip` (interpolating `cart.shippingData.address.postalCode`) or `freight.unavailableGeneral` when no CEP is set, a bullet list of unavailable item names, and a masked CEP input (`99999-999`) with a "Calcular" button. `handleFreight(cep)`:
1. `resolveZipCode(cep)` (`freigthService` → `Vtex.checkout.resolveZipCode`),
2. provider `setLogisticInfo({ address: { addressType: 'residential', postalCode, street, neighborhood, city, state, country, geoCoordinates }, clearAddressIfPostalCodeNotFound: true })`,
3. `savePostalCodeOnStorage(cep)` (`customerService` → `Vtex.customer.setCustomerData('postalCode', ...)`).

### MinimumOrderValue (`MinimumOrderValue/MinimumOrderValue.jsx`)
Calls `getMinimumOrderStatus(cart, fallbackMinimumValueInCents)` (see Utils). Returns `null` when `!cart`, when `minimumValueInCents <= 0` (feature disabled / remote config absent) or when the minimum is already reached — so it only renders while the cart is **below** the minimum. Renders `minimumOrderValue.missing` with the formatted `missingValueInCents` plus a progress bar (`width: progress%`). The `minimumOrderValue.reached` branch in the JSX is unreachable given the early return.

### ActionButton (`ActionButton/ActionButton.jsx`)
Fixed bottom bar (`fixed bottom-0 ... z-50`) with a `CustomButton` labeled `cartSummary.labelFinish` ("Finalizar Compra"), followed by a `h-[77px]` spacer so page content is not hidden behind it. `isValidToProceed()` (used both for `disabled` and as a guard in `goToCheckout`) requires, in order:
1. `cart` truthy; 2. `cart.items` truthy; 3. `cart.items.length > 0`; 4. **no** item with `availability !== 'available'`; 5. `hasReachedMinimumOrderValue(cart)`.

On press: `navigateToCheckout(cart.orderFormId)`.

### Quantity (`Quantity/Quantity.jsx`)
Stateless stepper: minus is guarded by `quantity > 1 && handleItemQuantity(-1)`; plus always fires `handleItemQuantity(1)`. The `disable` prop only greys the icons (`text-gray-300`) — it does not block the plus click.

### ModalConfirm (`ModalConfirm/ModalConfirm.jsx`)
Renders `null` unless `showModal`. Full-screen overlay (`z-[9999]`, black/70 backdrop) with the `text` and two buttons: `modal.confirm.delete` (btn-error) → `removeItem`, and outlined `modal.confirm.cancel` → `closeModal`. The backdrop click handler checks `typeof onClose === 'function'` but no `onClose` exists in scope, so tapping the backdrop is a no-op (only Cancel closes it).

### InstallmentsMsg (`InstallmentsMsg/InstallmentsMsg.jsx`) — unused
Scans `cart.paymentData.installmentOptions` with `findMaxInstallments` and renders "Parcelamento em até Nx" with a card SVG when max installments ≥ 2. Not imported by any view/component.

### SaveButton (`SaveButton/SaveButton.jsx`) — unused
Bookmark-style "Salvar/Salvo" button taking `handleSaveFavorite` and `isInWishlist`. Superseded by shared `HeaderWishList` inside `CartItem`; not imported anywhere.

## 4. Services (`src/services/`)

### `cartService.js`
| Function | VTEX API |
|---|---|
| `getCart()` | `Vtex.cart.getCurrentOrCreateCart()` |
| `addItemToCart(payload)` | `Vtex.checkout.addItem(payload)` |
| `saveCartIdOnStorage(orderFormId)` | `Vtex.cart.saveCartIdOnStorage(orderFormId)` |
| `addItemOffer(itemIndex, offeringId)` | `Vtex.cart.addOfferingsItems(...)` |
| `removeItemOffer(itemIndex, offeringId)` | `Vtex.cart.removeOfferingsItems(...)` |
| `changeItemQuantity(index, newQuantity)` | `Vtex.cart.changeItemQuantity(...)` |
| `removeCartItem(index)` | `Vtex.cart.removeItem(index)` |
| `addCoupon(coupon)` | `Vtex.checkout.addPromoCode(coupon)` |
| `removeCoupon()` | `Vtex.checkout.addPromoCode('')` |

### `freigthService.js` (filename intentionally misspelled — "freigth")
| Export | Used? | VTEX API |
|---|---|---|
| `setLogisticInfo(payload)` | yes (provider ← Freight) | `Vtex.checkout.setLogisticInfo` |
| `setNewAddress(cart, zipCode)` | wired into provider, no UI caller | `Vtex.checkout.resolveZipCode` + `setLogisticInfo` with `generateSelectedAddressesPayload` (maps existing `selectedAddresses` or builds disposable `search` + `residential` addresses) |
| `resolveZipCode(zipCode)` | yes (Freight) | `Vtex.checkout.resolveZipCode` |
| `simulateCart(zipCode, cart)` | no | `Vtex.cart.simulateCart` |
| default `fetchFreight(zipCode, currentSku)` | no | `resolveZipCode` + `setLogisticInfo` (result discarded; contains a leftover `console.log('payload', ...)`) |
| `generateLogisticInfoPayload` (private) | no callers | — |

### `customerService.js`
| Export | Used by | VTEX API |
|---|---|---|
| `checkWishlistItem(productId)` | CartItem | `Vtex.wishlist.checkItem` (guarded by `isLoggedIn()`) |
| `addToWishlist(productId, title, sku)` | CartItem | `Vtex.wishlist.addItem` after `requestLogin()` |
| `removeItemFromWishlist(id)` | CartItem | `Vtex.wishlist.removeItem` |
| `requestLogin()` | via addToWishlist | opens `account` app (`Eitri.nativeNavigation.open({ slug: 'account', initParams: { action: 'RequestLogin', closeAppAfterLogin: true } })`), resolves/rejects on resume based on `isLoggedIn()` |
| `isLoggedIn()` | internal | `Vtex.customer.isLoggedIn()` (returns `false` on error) |
| `savePostalCodeOnStorage(postalCode)` | Freight | `Vtex.customer.setCustomerData('postalCode', ...)` |
| `getPostalCodeOnStorage()` / `loadPostalCodeFromStorage()` | unused (identical duplicates) | `Vtex.customer.getCustomerData('postalCode')` |
| `productOnWishlist(productId)` | unused (duplicate of `checkWishlistItem`) | `Vtex.wishlist.checkItem` |

A module-level `let CheckLoginPromise = null` is declared and never used.

### `navigationService.js`
- `navigateToCheckout(orderFormId)` — `Eitri.nativeNavigation.open({ slug: 'checkout', initParams: { orderFormId } })`.
- `openProduct(productId)` — `Eitri.nativeNavigation.open({ slug: 'pdp', initParams: { productId } })`.

### `AppService.js`
- `startConfigure()` — `App.tryAutoConfigure({ verbose: false, gaVerbose: false })` (`eitri-shopping-vtex-shared`); bootstraps VTEX account config + remote config before any cart call.

### `trackingService.js` — unused
- `sendPageView(pageName)` → `Tracking.ga.logScreenView(pageName)`. No callers; all tracking goes through the shared `TrackingService` instead.

## 5. Provider — `src/providers/LocalCart.jsx`

Default export `CartProvider({ children })` creating the `LocalCart` context. It is never imported/mounted in app code — the Eitri build wires default-exported providers from `src/providers/` around the view tree (workspace-wide convention; the checkout app uses the same pattern).

**`executeCartOperation(operation, ...args)`** is the single wrapper for every mutation: sets `cartIsLoading = true`, awaits `operation(...args)`, calls `setCart(newCart)` **only if the operation returned a truthy cart** (so services that swallow errors and return `undefined`, like `freigthService.setNewAddress`, leave the previous cart intact), sets `cartIsLoading = false`, returns `newCart`.

`useLocalShoppingCart()` returns:

| Member | Wraps (service fn) |
|---|---|
| `cart`, `setCart`, `cartIsLoading` | raw state |
| `startCart()` | `getCart` |
| `addItem(payload)` | `addItemToCart` |
| `addItemOffer(itemIndex, offeringId)` | `addItemOffer` |
| `removeItemOffer(itemIndex, offeringId)` | `removeItemOffer` |
| `changeQuantity(index, newQuantity)` | `changeItemQuantity` |
| `removeItem(index)` | `removeCartItem` |
| `setNewAddress(cart, zipCode)` | `setNewAddress` (freigthService) |
| `setLogisticInfo(cart, zipCode)` | `setLogisticInfo` (freigthService; actually receives a single payload object from Freight) |
| `addCoupon(coupon)` / `removeCoupon()` | `addCoupon` / `removeCoupon` |

Note `addItem` and `setNewAddress` are exposed but have no callers inside this app (`addItem` exists for parity with other apps).

## 6. Utils (`src/utils/`)

### `utils.js`
- `formatAmountInCents(amount, locale='pt-BR', currency='BRL')` — non-number → `''`; `0` → the string `'Grátis'`; otherwise `(amount/100).toLocaleString(...)`.
- `formatDate(date)` — `toLocaleDateString('pt-br')` (unused in this app).

### `minimumOrderValue.js`
- `getCartValueInCents(cart)` — `max(0, Items.value + Discounts.value)` from `cart.totalizers` (Discounts is negative).
- `getMinimumOrderValueInCents(cart, fallback)` — returns `RemoteConfig.getContent('appConfigs.minimumOrderValueInCents')` (`eitri-shopping-vtex-shared`). The `fallback` param and a commented-out seller-based (`seller.minimumOrderValue`) implementation are dead.
- `getMinimumOrderStatus(cart, fallback)` — status object shape: `{ currentValueInCents, minimumValueInCents, missingValueInCents, progress, hasReachedMinimumOrderValue }`. If `minimumValueInCents <= 0`: `missing=0`, `progress=100`, `hasReached=true`. Otherwise `missing = max(min - current, 0)`, `progress = min(current/min*100, 100)`, `hasReached = missing === 0`.
- `hasReachedMinimumOrderValue(cart, fallback)` — convenience boolean over `getMinimumOrderStatus`.

## 7. Checkout handoff

1. `ActionButton.goToCheckout()` runs `isValidToProceed()`: cart exists, has items, **every** item has `availability === 'available'`, and `hasReachedMinimumOrderValue(cart)`.
2. If valid: `navigateToCheckout(cart.orderFormId)` → `Eitri.nativeNavigation.open({ slug: 'checkout', initParams: { orderFormId } })`.
3. The checkout app (`eitri-shopping-template-vtex-deco-checkout/src/views/Home.jsx:58-59`) reads `startParams.orderFormId` from `Eitri.getInitializationInfos()` and calls its own `saveCartIdOnStorage(orderFormId)` before loading the same VTEX orderForm — the orderFormId string is the entire contract between the two apps.

## 8. Analytics

All via shared `TrackingService` (`eitri-shopping-template-vtex-deco-shared/src/services/TrackingService.js`), which fans out to Firebase GA (`Eitri.exposedApis.fb`) and Insider (`Eitri.exposedApis.insider`):

| Trigger | Call | Emits |
|---|---|---|
| Home loaded/resumed | `sendScreenView('Carrinho', 'HomeCart')` | `fb.currentScreen` |
| Home loaded/resumed | `viewCartEvent(cart)` | GA `view_cart` (currency BRL, value from `Items` totalizer, mapped items) + Insider `visitCartPage` |
| Item removed (`CartItemsContent.handleRemoveCartItem`) | `removeFromCartEvent(cart, index)` | GA `remove_from_cart` + Insider `itemRemovedFromCart` |
| EmptyCart mounted | `sendScreenView('Carrinho vazio', 'EmptyCart')` | `fb.currentScreen` |

No `add_to_cart`/`begin_checkout` events are fired here (adding happens in PDP; `begin_checkout` is the checkout app's responsibility).

## 9. Gotchas / conventions

- **`freigthService.js` is misspelled on purpose** ("freigth" instead of "freight") and imported with that spelling everywhere — do not "fix" the filename without updating `LocalCart.jsx` and `Freight.jsx` imports.
- **Eitri globals**: `useState`, `useEffect`, `View`, `Toggle`, `Loading`, `Page` etc. are used without imports in several files (e.g. `Home.jsx`, `CartItem.jsx`); the Eitri toolchain injects React hooks and luminus globals. Some files import them explicitly anyway — both styles coexist.
- **Provider auto-mount**: `CartProvider` has no explicit mount point; Eitri wires `src/providers/` default exports automatically.
- **Dead/unused code**: components `InstallmentsMsg` and `SaveButton`; service file `trackingService.js` (`sendPageView`); in `freigthService.js`: `simulateCart`, default `fetchFreight` (with leftover `console.log`), `generateLogisticInfoPayload`; in `customerService.js`: `getPostalCodeOnStorage`/`loadPostalCodeFromStorage` (duplicates), `productOnWishlist` (duplicate of `checkWishlistItem`), unused `CheckLoginPromise`; provider members `addItem` and `setNewAddress` have no callers; a commented-out unavailable-item message block in `CartItem` and shipping row in `CartSummary`.
- **ModalConfirm backdrop** references an undefined `onClose`, so tapping outside the dialog does nothing; only Cancel/Excluir close it.
- **Coupon loading state** is ineffective: `addCoupon` is not awaited, so `isLoading` flips back synchronously.
- **MinimumOrderValue "reached" text is unreachable** — the component returns `null` once the minimum is met.
- **Quantity `disable` prop is cosmetic** — it greys icons but does not prevent the plus click.
- **Service worker** (`src/workers/service-worker.js`) caches image requests; the `MAX_AGE` constant is `12 * 24h` (12 days) despite the comment saying "24 horas". Cache misses that also fail to fetch return a 1x1 blank PNG.
- **`openWithBottomBar` semantics**: derived from `tabIndex` truthiness. The cart tab uses `tabIndex=2`; a hypothetical tab at index 0 would be treated as "not a tab" (falsy) and show the return header.
