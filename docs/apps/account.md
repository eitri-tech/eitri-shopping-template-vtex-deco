# Account App (eitri-shopping-template-vtex-deco-account)

Account/profile mini-app of the Eitri workspace (VTEX backend). Source: `eitri-shopping-template-vtex-deco-account/`. Version `0.1.4` (`eitri-app.conf.js`). Dependencies: eitri-luminus `2.22.6`, eitri-bifrost `5.4.0`, eitri-commons `2.2.1`; shared eitri-apps: `eitri-shopping-template-vtex-deco-shared` `0.1.3`, `eitri-shopping-vtex-shared` `1.15.4`, `i18n` `14.1.2`. Views use file-based routing under `src/views/`; UI is eitri-luminus components (no raw HTML, except deliberate exceptions noted below).

## 1. Purpose & entry points

Responsibilities: authentication (login/registration/password), profile editing, order history/details/cancellation, wishlist, addresses, saved cards.

Entry points:

1. **Bottom tab "Perfil"** — registered in root `app-config.yaml` under `bottom-tab-view-simulation` with `initialization-params: tabIndex=4`. Opens at `src/views/Home.jsx`.
2. **Login request from other apps** — pdp (`src/services/customerService.js`), home (`src/services/CustomerService.js`), cart (`src/services/customerService.js`), and checkout (`src/services/navigationService.js`, `src/services/CustomerService.js`) each define `requestLogin()` that calls `Eitri.nativeNavigation.open({ slug: 'eitri-shopping-template-vtex-deco-account', initParams: { action: 'RequestLogin', closeAppAfterLogin: true } })`. `Home.jsx` `init()` reads `Eitri.getInitializationInfos()`; when `startParams?.action === 'RequestLogin'` it navigates to `PAGES.SIGNIN` with `{ closeAppAfterLogin: true }` and `replace=true`.
3. **Deep link / route param** — if `startParams.route` is present, `Home.jsx` `processDeepLink()` navigates to `{ path: route, state: <remaining params>, replace: true }`, so any view can be targeted directly with initialization params as state.

Auth state propagation back to other apps: the shared `eitri-shopping-vtex-shared` login/logout internals publish broadcast EventBus events `EventBusChannels.USER_LOGGED_IN` / `EventBusChannels.USER_LOGGED_OUT`. Sibling apps (and this app's `Wishlist.jsx`) subscribe to those channels to refresh session-dependent state. When opened with `closeAppAfterLogin`, `SignIn.jsx` calls `Eitri.close()` after successful login, returning the user to the calling app.

`Home.jsx` also registers `Eitri.navigation.setOnResumeListener(init)`, so returning to the tab re-checks login state, and calls `loadMe()` (`getCustomerData`) when logged in or `doLogout()` when the session says otherwise.

## 2. Authentication

All auth functions live in `src/services/CustomerService.js` and wrap `Vtex.customer.*`.

### Login modes (`src/views/SignIn.jsx`)

- Providers loaded via `loadLoginProviders()` → `StoreService.getLoginProviders()` → `Vtex.store.getLoginProviders()`.
- Two modes: `emailAndPassword` (default) and `emailAndAccessKey` (OTP). If the store returns `!passwordAuthentication && accessKeyAuthentication`, OTP becomes the default mode.
- **Email/password**: `doLogin(email, password)` → `Vtex.customer.loginWithEmailAndPassword`. Success when result is the string `'Success'`; fires `TrackingService.loginEvent('password')`.
- **Email access key (OTP)**: `sendAccessKeyByEmail(email)` then `loginWithEmailAndKey(email, code)` → `Vtex.customer.loginWithEmailAndAccessKey`. 60-second resend timer. Fires `loginEvent('otp')`.
- **Social (Google/Facebook)**: rendered via `src/components/SocialLogin.jsx` only when ALL are true: `applicationData?.platform === 'android'` (from `Eitri.getConfigs()`), `Eitri.canIUse('23')`, and provider list contains OAuth entries. Calls `loginWithGoogle()` / `loginWithFacebook()` (`Vtex.customer.loginWithGoogle/loginWithFacebook`).
- On success, `onLoggedIn()`: if route state has `redirectTo` → `navigate('/' + redirectTo)`; else if `closeAppAfterLogin` → `Eitri.close()`; else `Eitri.navigation.back()`. Email is persisted via `saveUserEmailOnStorage` in `finally` blocks.
- Session check everywhere: `isLoggedIn()` → `Vtex.session.getSession()` → `namespaces.profile.isAuthenticated.value === 'true'`.

### Registration (`src/views/SignUp.jsx`)

Registration is the VTEX OTP flow: prefill email from `getSavedUser()`, `sendAccessKeyByEmail` (60s timer), `loginWithEmailAndKey`; on `'Success'` navigate to `PAGES.EDIT_PROFILE` to complete profile data. HTTP 5xx errors surface the service message.

### Password reset (3 views)

| Step | View | Action |
|---|---|---|
| 1 | `src/views/PasswordReset.jsx` | Email input (prefilled from route state), `sendPasswordResetCode(username)` (alias of `sendAccessKeyByEmail`), navigate to `PASSWORD_RESET_CODE` with `{email}` |
| 2 | `src/views/PasswordResetCode.jsx` | 6-digit code input (`RECOVERY_CODE_LENGTH = 6`), no API call; navigate to `PASSWORD_RESET_NEW_PASS` with `{email, recoveryCode}` |
| 3 | `src/views/PasswordResetNewPass.jsx` | New password + confirmation; requirements: >= 8 chars, number, uppercase, lowercase. `setPassword(email, recoveryCode, newPassword)` → navigate `HOME` with `replace=true` |

### Change password (`src/views/ChangePassword.jsx`)

Dual mode via `isFirstPassword = passwordLastUpdate === null` (Home passes `email` + `passwordLastUpdate` in state):
- **First password** (account created via OTP only): auto-sends an access key on mount, then `setPassword(email, code, newPassword)`.
- **Regular change**: `changePassword(email, currentPassword, newPassword)` → `Vtex.customer.setPassword(email, '', newPassword, currentPassword)`.

### Logout

`Home.jsx` calls `doLogout()` (`Vtex.customer.logout`) plus `removeClientData()` (`Vtex.cart.removeClientData`) to detach the cart profile, then re-runs `init()`.

## 3. Views (`src/views/`)

| View | Protected | Responsibility |
|---|---|---|
| `Home.jsx` | No (adapts) | Hub: init/deep link/RequestLogin handling, login state, `InfoCard` or `LoginCard`, `ProfileCardButton` menu, logout, footer (`PoweredBy`, `AppVersion`) |
| `SignIn.jsx` | No | Login (password / OTP / social), redirect logic |
| `SignUp.jsx` | No | Registration via OTP, forwards to EditProfile |
| `PasswordReset.jsx` | No | Reset step 1: email |
| `PasswordResetCode.jsx` | No | Reset step 2: code |
| `PasswordResetNewPass.jsx` | No | Reset step 3: new password |
| `ChangePassword.jsx` | No | Change/create password (dual mode) |
| `EditProfile.jsx` | No | Profile form; delete-account link |
| `OrderList.jsx` | **Yes** (`ProtectedView`, redirect `'OrderList'`) | Paginated order history with `InfiniteScroll` |
| `OrderDetails.jsx` | **Yes** (redirect `'OrderDetails'`, `redirectState={orderId}`) | Full order detail + cancellation |
| `Wishlist.jsx` | No | Wishlist grid; reacts to EventBus login/wishlist events |
| `AddressList.jsx` | **Yes** (redirect `'AddressList'`) | Address CRUD list |
| `AddressForm.jsx` | No | Create/edit address, CEP autofill |
| `SavedCards.jsx` | **Yes** (redirect `'SavedCards'`) | Saved card list + delete |
| `AddCardForm.jsx` | No | New card form with reCAPTCHA (currently unreachable from UI, see Gotchas) |

View-level notes:

- **`Home.jsx`** — menu targets: `EDIT_PROFILE`, `WISH_LIST`, `ADDRESS_LIST`, `CHANGE_PASSWORD` (logged only; passes `email`/`passwordLastUpdate`), `SAVED_CARDS` (logged only), `ORDER_LIST`. When logged out, menu items go to `SIGNIN` with `redirectTo` set to the target. Sends two screen views: `'Perfil'` and `'Minha conta'`.
- **`EditProfile.jsx`** — fields: firstName, lastName, birthDate (mask `99/99/9999`, must be >= 18 years in `convertToISO`), homePhone (normalized to `+55` prefix), gender (Radio male/female), document (CPF: 11 digits + `verifySocialNumber` checksum). Saves via `setCustomerData`. Delete-account URL from `RemoteConfig.getContent('appConfigs.deleteAccountUrl')`, opened via `Eitri.openBrowser`. Loads customer from route state or `getCustomerData()`.
- **`OrderList.jsx`** — pagination detailed in section 7.
- **`OrderDetails.jsx`** — accepts route state `{order}` (full object) or `{orderId}` (fetched via `getOrderById`); otherwise navigates back. Detailed in section 7.
- **`Wishlist.jsx`** — `getWishlist()` → 2-column grid of `WishlistItem`. Broadcast EventBus subscriptions: `USER_LOGGED_IN` → reload, `USER_LOGGED_OUT` → clear, `'addToWishlist'`/`'removeFromWishlist'` → reload. `openWithBottomBart = !!props?.location?.state?.tabIndex` hides the `HeaderReturn` (used when opened as a tab/deep link).
- **`AddressList.jsx`** — inline `AddressCard`; edit navigates to `ADDRESS_FORM` with `{address}`, delete uses `ModalConfirm` with optimistic removal then `deleteAddress`.
- **`AddressForm.jsx`** — edit mode when route state contains `address` (has `addressId`). CEP mask `99999-999`; when 8 digits, `resolvePostalCode` autofills street/neighborhood/city/state/country/geoCoordinates. `validateAddress` requires all fields except complement/reference. Submits `updateAddress(addressId, rest)` or `createAddress(address)` then `back()`.
- **`SavedCards.jsx`** — `getSavedCards()`; card rows show `paymentSystemName`, masked `cardNumber`, `expirationDate`, expired flag. Delete = `ModalConfirm` + optimistic removal + `deleteSavedCard(id)` (reload on failure). The "add card" button is commented out.
- **`AddCardForm.jsx`** — reCAPTCHA site key from `Eitri.environment.getRemoteConfigs()` → `appConfigs.checkout.recaptchaKey`. Card fields: 16-digit number mask, letters-only holder, `MM/AA` expiry, CSC as password, brand chips (`PAYMENT_SYSTEMS`: Visa, Mastercard, Amex, Elo, Hipercard, Diners), CPF/CNPJ document. Billing address: pick from `getAddresses()` or manual with CEP autofill. Submit: `recaptchaRef.current.getRecaptchaToken()` (only when a site key exists) → `addNewCard({...card, address}, captchaToken)` → `back()`.

## 4. Components (`src/components/`)

| Component | Purpose / notable logic |
|---|---|
| `ProtectedView.jsx` | Auth guard. If `!isLoggedIn()` → `Eitri.navigation.navigate({ path: 'SignIn', replace: true, state: { redirectTo: afterLoginRedirectTo, redirectState } })`. Renders a loading state, then children. Note: SignIn only consumes `redirectTo`; `redirectState` is never forwarded. |
| `OrderCard.jsx` | Order list card. Fetches the FULL order via `getOrderById` on mount (N+1 pattern). Copies orderId to clipboard with `useSnackBar` toast. Item thumbnails from `orderDetail.items`; total via `formatPriceInCents(order.totalValue)`. Renders `OrderStatusBadge` and `OrderBuyAgain`. Bug: when the detail fetch has not resolved, it navigates with `{order: order.orderId}` (orderId under the `order` key) while `OrderDetails` expects `{orderId}`. |
| `OrderStatusBadge.jsx` | Badge from `getOrderBadgeVariant` + `getCurrentOrderStageLabel`; variant → bg/content class map (info/success/warning/neutral). |
| `OrderStatusTimeline.jsx` | Renders `getOrderStages(order)`: done = filled green (#40A040), doing = ring with dot, not-started = gray; vertical connectors. |
| `OrderBuyAgain.jsx` | Loops `order.items`, calls `addItem({id, quantity, seller})` from `useLocalShoppingCart`, then opens the cart app (`Eitri.nativeNavigation.open({slug: 'cart'})`). |
| `ProductCard/ProductCard.jsx` | Wrapper around shared `ProductCardFullImage` (via `React.createElement`). Picks first SKU with `AvailableQuantity > 0` (else `items[0]`), `sellerDefault`, price = `min(Price, spotPrice)`, discount %, installments. Badges via shared `getBadgesForProducts(product, item, Vtex, 'badges')`. Multi-SKU products route to PDP instead of direct add. Subscribes to broadcast `addToWishlist`/`removeFromWishlist` to sync heart state (`wishListIdRef`). Fires `TrackingService.addToCartEvent`. |
| `ProductCard/productCard.hooks.js` | `useCartItem(cart, itemId)` (memoized find); `useWishlist(productId)`: `productOnWishlist` check on mount, optimistic `addToList`/`removeFromList`/`toggle`, tracks `wishListId`. |
| `ProductCard/productCard.utils.js` | `getProductVideo` (via `App.configs` product video tag), `formatInstallments` ("em até Nx R$..." max interest-free), `getFormattedListPrice` (empty when equal to price), `calculateBadge` (cluster `'4392'` → "retire em 2h"; teaser "compre e ganhe" → "leve+ pague-"; unused by ProductCard, which uses the shared helper). |
| `WishlistItem.jsx` | Fetches product by `getProductById(productId)` and renders `ProductCard`. |
| `SocialLogin.jsx` | Google/Facebook buttons filtered by `oAuthProviders[].providerName`; runs `loginWithGoogle`/`loginWithFacebook` then invokes the `handleSocialLogin` callback. |
| `ModalConfirm.jsx` | Fixed-overlay confirm dialog (`showModal`, `removeItem`, `closeModal`, `message`, default `t('modalConfirm.deleteAddress')`). Bug: backdrop `onClick` references an undefined `onClose`. |
| `InfiniteScroll.jsx` | Window scroll listener; fires `onScrollEnd` within 500px of document bottom; `scrollEnded` flag prevents repeat firing until scrolled away. |
| `Alert.jsx` | Bottom fixed alert, types positive/warning/negative (inline SVGs), auto-dismiss after `duration` seconds + 300ms animation. |
| `LoginCard.jsx` | Logged-out CTA on Home → `SIGNIN` with `redirectTo: 'Home'`. |
| `InfoCard.jsx` | Logged-in header: avatar circle with first letter of `firstName ?? email`, name + email. |
| `ProfileCardButton.jsx` | `GenericBox` row: icon + label + `FiChevronRight`. |
| `AppVersion.jsx` | `Eitri.getConfigs()` → `superAppData.version`. |
| `NoItem.jsx` | Empty state (`FiPackage` + title/subtitle). |
| `ImageCard.jsx` | Fixed 48x48 image wrapper. |
| `PoweredBy.jsx` | Eitri logo footer; easter egg: 5 taps opens a fullscreen Lottie overlay. |
| `CCheckbox.jsx` | Checkbox + label wrapper (appears unused). |

## 5. Services (`src/services/`)

### `CustomerService.js` (all wrap `Vtex.customer.*` unless noted)

| Domain | Function | VTEX API |
|---|---|---|
| Auth | `doLogin(email, password)` | `loginWithEmailAndPassword` |
| Auth | `loginWithEmailAndKey(email, code)` | `loginWithEmailAndAccessKey` |
| Auth | `sendAccessKeyByEmail(email)` | `sendAccessKeyByEmail` |
| Auth | `sendPasswordResetCode(username)` | alias of `sendAccessKeyByEmail` |
| Auth | `setPassword(email, accessKey, newPassword)` | `setPassword` |
| Auth | `changePassword(email, currentPassword, newPassword)` | `setPassword(email, '', newPassword, currentPassword)` |
| Auth | `loginWithGoogle()` / `loginWithFacebook()` | `loginWithGoogle` / `loginWithFacebook` |
| Auth | `doLogout()` | `logout` |
| Auth | `isLoggedIn()` | `Vtex.session.getSession()` → `namespaces.profile.isAuthenticated.value === 'true'` |
| Profile | `getSavedUser()` | `retrieveCustomerData` |
| Profile | `getCustomerData()` | `getCustomerProfile` → `result.data.profile` |
| Profile | `setCustomerData(profile)` | `updateCustomerProfile` (explicit 13-field payload) |
| Profile | `saveUserEmailOnStorage` / `loadUserEmailFromStorage` | `setCustomerData('email')` / `getCustomerData('email')` |
| Profile | `removeClientData()` | `Vtex.cart.removeClientData` |
| Orders | `listOrders(page)` | `listOrders` |
| Orders | `getOrderById(orderId)` | `getOrderById` |
| Wishlist | `getWishlist()` | `Vtex.wishlist.listItems` → `data.viewLists[0].data` |
| Wishlist | `addToWishlist(productId, title, sku)` | `Vtex.wishlist.addItem` |
| Wishlist | `removeFromWishlist(id)` / `removeItemFromWishlist(id)` | both `Vtex.wishlist.removeItem` (duplicates) |
| Wishlist | `productOnWishlist(productId)` | `Vtex.wishlist.checkItem`; returns `{inList: false}` when not logged |
| Cards | `getSavedCards()` | returns `result.payments \|\| []` |
| Cards | `addNewCard(cardData, recaptchaToken)` | `addNewCard` |
| Cards | `deleteSavedCard(cardId)` | `deleteSavedCard` |

### Other services

- **`NavigationService.js`** — `navigate(page, state = {}, replace = false)` → `Eitri.navigation.navigate`; `openProduct(product)` → `Eitri.nativeNavigation.open({slug: 'pdp', initParams: {product}})`; `openCart()` → slug `'cart'`. `PAGES` constants: `HOME '/Home'`, `SIGNIN '/SignIn'`, `SIGNUP '/SignUp'`, `PASSWORD_RESET`, `PASSWORD_RESET_CODE`, `PASSWORD_RESET_NEW_PASS`, `LOGIN '/Login/Login'` (stale — no such view), `EDIT_PROFILE`, `ORDER_LIST`, `ORDER_DETAILS`, `WISH_LIST '/WishList'`, `ADDRESS_LIST`, `ADDRESS_FORM`, `CHANGE_PASSWORD`, `SAVED_CARDS`, `ADD_CARD_FORM`.
- **`AddressService.js`** — `getAddresses` (`Vtex.customer.getAddresses` → `data.profile.addresses || []`), `createAddress`, `updateAddress`, `deleteAddress`, `resolvePostalCode` (`Vtex.cart.resolvePostalCode`).
- **`StoreService.js`** — `getLoginProviders()` → `Vtex.store.getLoginProviders()`.
- **`AppService.js`** — `startConfigure()` → `App.tryAutoConfigure({verbose: false, gaVerbose: false})` (called by every view on mount).
- **`CartService.js`** — `getCart` (`Vtex.cart.getCurrentOrCreateCart`), `addItemToCart` (`addItem`), `removeCartItem` (`removeItem`), `updateItemOnCart` (`changeItemQuantity`). All swallow errors with console logs.
- **`ProductService.js`** — `getProductById(productId)` → `Vtex.searchGraphql.product({identifier: {field: 'id', value: productId}})`.
- **`TrackingService.js`** — `sendScreenView(friendlyScreenName, screenFilename)` delegating to the shared `TrackingService.sendScreenView` inside try/catch.
- **`Recaptcha.js`** — `forwardRef` component (one of the raw-HTML exceptions): renders `<button id='g-recaptcha-button' className='g-recaptcha' data-sitekey=... data-action='submit'/>`, waits for the element with a `MutationObserver`, calls `window.grecaptcha.render`, exposes `getRecaptchaToken()` (= `window.grecaptcha.execute()`) via `useImperativeHandle`. Used only by `AddCardForm`.

## 6. Providers & utils

- **`src/providers/SnackBar.jsx`** — context (`SnackBarComponent` provider + `useSnackBar`); `showSnackBar(type, message)` with types `success` (FiCheck) and `trash` (FiTrash2); fixed-bottom toast, auto-close 4s.
- **`src/providers/LocalCart.jsx`** — `CartProvider` + `useLocalShoppingCart`; holds `cart` state and `startCart`/`addItem`/`removeItem`/`updateItemQuantity` delegating to `CartService`.
- **Important**: neither `CartProvider` nor `SnackBarComponent` is mounted anywhere in this app. Both contexts are `createContext({})`, so `useSnackBar()`/`useLocalShoppingCart()` in `OrderCard`, `ProductCard` and `OrderBuyAgain` return `{}` — `showSnackBar` and `addItem` are `undefined` at runtime (calls will throw inside their try/catch or fail silently). See Gotchas.
- **`src/utils/utils.js`** — `formatPrice` (locale/currency from `App.configs.storePreferences`, defaults pt-BR/BRL); `formatPriceInCents` (divides by 100; `0` → `'Grátis'`; non-number → `''`); `formatDateDaysMonthYear` ("D de <mês> de YYYY"); `formatDate` (`toLocaleDateString('pt-br')`); default export `formatDateMMDDYYYY` actually returns `DD/MM/YYYY` from an ISO string using UTC getters (misleading name).
- **`src/utils/getFullOrderState.js`** — order status logic, see section 7.
- **`src/utils/backToTopListener.js`** — `addonUserTappedActiveTabListener()`: subscribes `Eitri.eventBus` channel `'onUserTappedActiveTab'` → `Eitri.navigation.backToTop()`. Called by nearly every view so re-tapping the "Perfil" tab scrolls/pops to top.
- **`src/utils/verifySocialNumber.js`** — CPF checksum validation (rejects length != 11 and repeated-digit CPFs; two mod-11 verification digits). Used by `EditProfile`.

## 7. Order domain

**Listing (`OrderList.jsx`)** — `listOrders(page)` returns `{list, paging}`. Pagination state uses refs: `pageRef = useRef(1)`, `maxPages = useRef(Infinity)` (set from `result?.paging?.pages`), `isFetchingRef` guard reset by a `useEffect` on `orders`, and `pageHasEnded` when a page comes back empty. `InfiniteScroll onScrollEnd` triggers the next page; results are appended. Empty history renders `NoItem`.

**Details (`OrderDetails.jsx`)** — data comes from `props.history.location.state` as `{order}` or `{orderId}` (fetched). Sections:
- Hero: `OrderStatusBadge`, orderId with clipboard copy (`Eitri.clipboard.setText`), `creationDate`.
- Address: `shippingData.address`; `addressType !== 'residential'` renders a pickup-point label instead of a delivery address.
- Payment: `paymentData.transactions[0].payments`; `paymentSystem === '6'` = Boleto (shows a "view boleto" button with the URL while `status === 'payment-pending'`); otherwise card name + `formatPriceInCents(value)` + installments.
- Totals: reduce-sum over `order.totals`.
- Timeline: `OrderStatusTimeline`, hidden when status is in `CANCELED_STATUSES`.
- Packages: `packageAttachment.packages` matched to `shippingData.logisticsInfo` by `itemIndex`. Shows `deliveryChannel === 'pickup-in-point'` vs courier (`deliveryCompany`), delivered date (`courierStatus.deliveredDate`) vs `shippingEstimateDate`, NF-e link when `invoiceKey` (nfe.fazenda.gov.br URL), and `trackingNumber`/`trackingUrl`. Falls back to a flat items list when there are no packages.
- Cancellation: when `order.allowCancellation`, a reason `Select` (6 hardcoded pt-BR reasons) enables `Vtex.customer.cancelOrder(orderId, {reason})`.

**Status mapping (`src/utils/getFullOrderState.js`)**:
- `CANCELED_STATUSES = ['canceled', 'cancel', 'cancellation-requested', 'waiting-for-seller-decision', 'request-cancel']`.
- `getCurrentStageIndex(order)`: delivered (any package `courierStatus.finished === true`) → 4; `invoice`/`invoiced` → 3; handling group (`window-to-cancel`, `ready-for-handling`, `authorize-fulfillment`, `release-to-fulfillment`, `handling`, `payment-approved`, `approve-payment`) → 2; `payment-pending` → 1; else 0.
- `STAGE_LABELS`: 5 stages, each with `not-started`/`doing`/`done` pt-BR labels; stages 3-4 have shipping vs pickup variants selected by `isPickupOrder` (ALL `logisticsInfo[].selectedDeliveryChannel === 'pickup-in-point'`).
- `getOrderStages(order)`: canceled → all `not-started`; index 4 → all `done`.
- `getOrderBadgeVariant`: canceled → `neutral`, delivered → `success`, `payment-pending` → `warning`, else `info`.
- `getCurrentOrderStageLabel`: `'canceled'` → "Cancelado"; other canceled statuses → "Cancelamento Solicitado"; otherwise the `doing` label of the current stage.

**Buy again (`OrderBuyAgain.jsx`)** — iterates `order.items` calling `addItem({id, quantity, seller})` (LocalCart → `CartService.addItemToCart` → `Vtex.cart.addItem`), then opens the cart app. Currently broken because `CartProvider` is not mounted (see Gotchas).

## 8. Analytics

- Every view calls `TrackingService.sendScreenView(friendlyName, viewFilename)` on mount (e.g. `Home.jsx` sends both `'Perfil'` and `'Minha conta'`; other views send their own names). Delegates to the shared `TrackingService` (GA via `App.tryAutoConfigure` setup).
- `SignIn.jsx` fires `TrackingService.loginEvent('password')` or `('otp')` (shared service) on successful login.
- `ProductCard.jsx` fires `TrackingService.addToCartEvent(product)` (shared service) on add-to-cart.

## 9. Gotchas / conventions

- **Unmounted providers**: `CartProvider` and `SnackBarComponent` exist but are never rendered in this app. Consumers (`OrderCard` copy-toast, `ProductCard` add-to-cart/snackbar, `OrderBuyAgain`) get an empty context object, so `showSnackBar`/`addItem` are `undefined` — "buy again" and product-card add-to-cart do not work in the account app as-is. `OrderList.jsx` even imports `SnackBarComponent` without rendering it.
- **OrderCard navigation bug**: when the eager `getOrderById` has not resolved, `openOrderDetails` navigates with `{order: order.orderId}` (a string under the `order` key); `OrderDetails` expects `{orderId}`, so it falls through to `back()`.
- **`ModalConfirm` backdrop** references an undefined `onClose` (dead code); only the buttons work reliably.
- **`PAGES.LOGIN = '/Login/Login'`** points to a view that does not exist — stale constant.
- **`formatDateMMDDYYYY`** (default export of `utils.js`) actually returns `DD/MM/YYYY`.
- **`ProtectedView` `redirectState`** is passed to SignIn but SignIn never forwards it after login — protected views needing state (e.g. `OrderDetails` with `orderId`) will land without it post-login.
- **Inconsistent protection**: `EditProfile`, `AddressForm`, `AddCardForm` and `Wishlist` are not wrapped in `ProtectedView`; they rely on being reached only from protected/menu flows (Home routes unauthenticated users to SignIn itself). Wishlist is intentionally public (shows empty state + reacts to login events).
- **`AddCardForm` is unreachable**: the add-card button in `SavedCards.jsx` is commented out.
- **Duplicate wishlist removals**: `removeFromWishlist` and `removeItemFromWishlist` in `CustomerService.js` are identical.
- **N+1 order fetches**: each `OrderCard` in the list fetches full order details on mount.
- **Conventions**: every view calls `startConfigure()` (App auto-configure) and `addonUserTappedActiveTabListener()` on mount; navigation always goes through `NavigationService.navigate` + `PAGES`; success is often signaled by the literal string `'Success'` from VTEX login APIs; services swallow errors with `console.log`/`console.error` and return `undefined`; i18n strings live in `src/locales/pt-BR/translation.json` via `useTranslation()` from `eitri-i18n`.
