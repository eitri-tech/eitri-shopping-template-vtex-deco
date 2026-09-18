# Checkout App (eitri-shopping-template-vtex-deco-checkout)

## 1. Purpose & Entry Points

Multi-step checkout flow for the store. Handles customer identification, shipping address, freight selection, payment processing, and order confirmation.

**Entry**: opened by the cart app via `Eitri.nativeNavigation.open({ slug: 'checkout', initParams: { orderFormId } })`.

**Init flow** (`src/views/Home.jsx:18-53`):
1. `startConfigure()` (VTEX auto-config)
2. In parallel: `getCustomer()` (check if logged in) + `loadCart()` (reads `orderFormId` from initParams → `saveCartIdOnStorage` → `startCart()`)
3. If logged customer's email differs from cart email → `addLoggedCustomerToCart` (removes old client data, adds new)
4. `loadCheckoutProfile(email)` — fetches VTEX checkout profile
5. `handleNavigation(cart)`:
   - Empty cart → `EmptyCart` (replace)
   - `cartHasCustomerData(cart)` → `FreightResolver` (has email + name + document + phone)
   - Otherwise → `PersonalData`

## 2. Step-by-Step Flow

```
Home (init, loading screen)
  |
  |-- empty cart --> EmptyCart
  |-- has customer data --> FreightResolver
  |-- no customer data --> PersonalData

PersonalData (email/CPF/CNPJ/name/phone)
  --> FreightResolver

FreightResolver (resolves shipping for cart address)
  |-- single freight group --> FreightSelector
  |-- multiple freight groups --> MultipleFreightSelector

FreightSelector (choose delivery SLA per item group)
  --> ShippingMethod

MultipleFreightSelector (choose SLA for each group)
  --> ShippingMethod

PickupSelector (choose pickup point, if pickup SLA selected)
  --> ShippingMethod

ShippingMethod (review selected shipping)
  --> PaymentData

PaymentData (choose payment method)
  |-- credit card --> AddCardForm --> Installments --> CheckoutReview
  |-- store card --> StoreCardForm --> CheckoutReview
  |-- PIX / instant --> CheckoutReview
  |-- Google Pay --> CheckoutReview
  |-- gift card --> (applied, stays on PaymentData or CheckoutReview)
  |-- bank invoice / boleto --> CheckoutReview
  |-- external --> CheckoutReview

CheckoutReview (final review + reCAPTCHA + pay)
  |-- success --> OrderCompleted
  |-- PIX --> PixOrder (QR code + 10-min polling)
  |-- external provider --> ExternalProviderOrder --> ExternalProviderOrderFinished
  |-- OTP required (CHK003/CHK0087/ORD062) --> OtpLogin modal --> retry payment
```

## 3. Views

### Entry & Routing

| View | File | Responsibilities |
|------|------|-----------------|
| **Home** | `src/views/Home.jsx` | Init: config, cart load (via orderFormId), customer detection, route to PersonalData or FreightResolver. Shows loading spinner. |
| **EmptyCart** | `src/views/EmptyCart.jsx` | Empty state with "continue shopping" or close app. |
| **Cartman** | `src/views/Cartman.jsx` | Debug tool for cart manipulation. |

### Customer Identification

| View | File | Responsibilities |
|------|------|-----------------|
| **PersonalData** | `src/views/PersonalData.jsx` | Collects email, first/last name, CPF/CNPJ, phone, DOB. Supports personal vs corporate toggle. Email field can trigger OTP login flow. Validates social number via `verifySocialNumber`. Calls `addPersonalData()` on the cart provider. |

### Address & Shipping

| View | File | Responsibilities |
|------|------|-----------------|
| **AddressForm** | `src/views/AddressForm.jsx` | Add/edit shipping address. Postal code lookup via `resolvePostalCode`. Field validation. |
| **AddressSelector** | `src/views/AddressSelector.jsx` | Pick from saved addresses (from checkout profile) or add new. Uses `AddressTypeTabs` (delivery vs pickup), `DeliveryAddressList`, `PickupPointList` sub-components. |
| **FreightResolver** | `src/views/FreightResolver.jsx` | Coordinator: sets address on cart → resolves shipping → routes to FreightSelector or MultipleFreightSelector. |
| **FreightSelector** | `src/views/FreightSelector.jsx` | Shows available delivery SLAs per item group. User selects preferred option. |
| **FreightGroupSelectorOptions** | `src/views/FreightGroupSelectorOptions.jsx` | UI for freight group options within a group. |
| **MultipleFreightSelector** | `src/views/MultipleFreightSelector.jsx` | Handles carts with items shipping from multiple origins/sellers. |
| **PickupSelector** | `src/views/PickupSelector.jsx` | Choose pickup point for in-store/partner pickup. |
| **ShippingMethod** | `src/views/ShippingMethod.jsx` | Review selected shipping: delivery options summary, edit buttons. Navigates to PaymentData. |

### Payment

| View | File | Responsibilities |
|------|------|-----------------|
| **PaymentData** | `src/views/PaymentData.jsx` | Payment method selector. Uses `PaymentMethods` component to show available groups. Resolves payment systems via `paymentSystemResolver`. |
| **AddCardForm** | `src/views/AddCardForm.jsx` | Credit card form: number, name, expiry, CVV. Card encryption via `jsencrypt` (RSA). |
| **StoreCardForm** | `src/views/StoreCardForm.jsx` | Store/loyalty card payment form. |
| **Installments** | `src/views/Installments.jsx` | Shows installment options for credit card. User selects count. |

### Order Completion

| View | File | Responsibilities |
|------|------|-----------------|
| **CheckoutReview** | `src/views/CheckoutReview.jsx` | Final review: `CartSummary`, `UserData`, `DeliveryData`, `SelectedPaymentData`. Checks unavailable items. reCAPTCHA (site key from remote config `appConfigs.checkout.recaptchaKey`). Calls `startPayment(cart, payload)` → `Vtex.checkout.payV2`. Routes to OrderCompleted / PixOrder / ExternalProviderOrder based on result. Handles OTP error codes (CHK003, CHK0087, ORD062) → shows OtpLogin. |
| **PixOrder** | `src/views/PixOrder.jsx` | Displays PIX QR code. Polls `getPixStatus(transactionId, paymentId)` for payment confirmation. 10-minute timeout. |
| **ExternalProviderOrder** | `src/views/ExternalProviderOrder.jsx` | Redirects to external payment gateway. |
| **ExternalProviderOrderFinished** | `src/views/ExternalProviderOrderFinished.jsx` | Returns from external provider, displays result. |
| **OrderCompleted** | `src/views/OrderCompleted.jsx` | Success screen. Shows order ID. Buttons: go home (`goHome`) or view orders (`openAccount`). Clears cart. |

## 4. Payment System

### Architecture

```
PaymentData view
  --> PaymentMethods (src/components/Methods/PaymentMethods.jsx)
      --> paymentSystemResolver(cart) groups payment systems by groupName
      --> renders GroupsWrapper for each group
          --> ImplementationInterface wrapper
              --> CreditCard / GooglePay / GiftCard / StoreCard / BankInvoice / InstantPayment / ExternalPayment
```

### Payment Groups (`src/components/PaymentsGroups/Groups/`)

| Group Component | File | Description |
|----------------|------|-------------|
| **CreditCard** | `Groups/CreditCard.jsx` | Lists saved cards from checkout profile. Select existing or add new. Shows card issuer icons via `CardIcon`. Billing address via `CreditCardBillingAddress` sub-component. |
| **GooglePay** | `Groups/GooglePay.jsx` | Google Pay integration. Calls `loadGPaymentData()` from `GPayService`. |
| **GiftCard** | `Groups/GiftCard.jsx` | Gift card code entry + balance validation. |
| **StoreCard** | `Groups/StoreCard.jsx` | Store/loyalty card option. Navigates to `StoreCardForm` view. |
| **BankInvoice** | `Groups/BankInvoice.jsx` | Boleto payment method. |
| **InstantPayment** | `Groups/InstantPayment.jsx` | PIX and other instant payment methods. |
| **ExternalPayment** | `Groups/ExternalPayment.jsx` | Redirects to third-party payment gateway. |
| **GroupsWrapper** | `Groups/GroupsWrapper.jsx` | Container for payment system groups. |
| **ImplementationInterface** | `ImplementationInterface.jsx` | Shared wrapper/interface for payment group implementations. |

### Other Payment Components

| Component | File | Purpose |
|-----------|------|---------|
| **CreditCardBillingAddress** | `Groups/Components/CreditCardBillingAddress.jsx` | Billing address selection for credit card payments. |
| **CreditCardDisplay** | `components/CreditCardDisplay/CreditCardDisplay.jsx` | Visual card preview with masked number. |
| **CardSelector** | `components/CardSelector/CardSelector.jsx` | Reusable option selector (radio-button style) for shipping/payment choices. |
| **CardIcon** | `components/Icons/CardIcons/CardIcon.jsx` | Maps card network to icon (Visa, Mastercard, etc.). |
| **MethodIcon** | `components/Icons/MethodIcon.jsx` | Maps payment method to icon (Card, GPay, Gift, Boleto, Pix). |

### Card Encryption

`src/utils/jsencrypt.min.js` — bundled RSA library. Used in `AddCardForm` to encrypt card data before sending to VTEX via `payV2`.

## 5. Other Components

| Component | File | Purpose |
|-----------|------|---------|
| **CartSummary** | `components/CartSummary/CartSummary.jsx` | Order totals: items, shipping, taxes, discounts, final total from cart totalizers. |
| **UserData** | `components/FinishCart/UserData.jsx` | Displays collected personal info in review. |
| **DeliveryData** | `components/FinishCart/DeliveryData.jsx` | Displays selected shipping address + method in review. |
| **SelectedPaymentData** | `components/FinishCart/SelectedPaymentData.jsx` | Displays selected payment method summary in review. |
| **ReviewMiniProducts** | `components/FinishCart/components/ReviewMiniProducts.jsx` | Product thumbnails in order review. |
| **AddressCard** | `components/AddressSelector/AddressCard.jsx` | Individual address display with select action. |
| **AddressTypeTabs** | `components/AddressSelector/AddressTypeTabs.jsx` | Delivery vs pickup toggle tabs. |
| **DeliveryAddressList** | `components/AddressSelector/DeliveryAddressList.jsx` | Scrollable list of saved delivery addresses. |
| **PickupPointList** | `components/AddressSelector/PickupPointList.jsx` | List of available pickup points. |
| **ShippingMethods** | `components/Methods/ShippingMethods.jsx` | Renders shipping option selection UI. |
| **PaymentMethods** | `components/Methods/PaymentMethods.jsx` | Orchestrates payment group rendering via `paymentSystemResolver`. |
| **OtpLogin** | `components/OtpLogin/OtpLogin.jsx` | Email OTP verification modal. Triggered when VTEX returns CHK003/CHK0087/ORD062 (email verification required before placing order). |
| **FixedBottom** | `components/FixedBottom/FixedBottom.jsx` | Fixed bottom bar with action button. |
| **Alert** | `components/Alert/Alert.jsx` | Notification/alert message. |
| **SimpleCard** | `components/Card/SimpleCard.jsx` | Generic card container. |
| **Loading** | `components/Shared/Loading/LoadingComponent.jsx` | Local loading spinner (separate from shared `Loading`). |

## 6. Providers

### `src/providers/LocalCart.jsx`

Context: `useLocalShoppingCart()`.

Much richer than the home/cart versions — wraps all checkout cart mutations:

| Method | Wraps | Purpose |
|--------|-------|---------|
| `startCart()` | `getCart` | Load existing cart |
| `generateNewCart()` | `Vtex.cart.generateNewCart` | Create fresh cart |
| `addItem(payload)` | `Vtex.cart.addItem` | Add item |
| `addPersonalData(userData)` | `Vtex.checkout.addUserData` | Set customer profile on cart |
| `addCustomerData(userData)` | Same as above | Alias |
| `setFreight(option)` | `Vtex.checkout.setLogisticInfo` | Set freight selection |
| `setNewAddress(address)` | `Vtex.checkout.setLogisticInfo` | Set shipping address |
| `setShippingAddress(payload)` | Same, different format | Alternative address setter |
| `setLogisticInfo(payload)` | Same | Raw logistics info |
| `selectPaymentOption(payload)` | `Vtex.checkout.selectPaymentOption` | Set payment. Clears gift cards first if present. |
| `setPaymentOption(payload)` | Same, no gift card clear | Direct payment set |
| `removeCartItem(index)` | `Vtex.cart.removeItem` | Remove item |
| `removeClientData()` | `Vtex.cart.removeClientData` + `getCart` | Clear customer data |
| `updateOpenTextField(receiver)` | `Vtex.cart.addOpenTextFieldToCart` | Set gift message receiver |
| `selectedPaymentData` / `setSelectedPaymentData` | State | Tracks selected payment display data |
| `cardInfo` / `setCardInfo` | State | Encrypted card fields |

### `src/providers/Customer.jsx`

Context: `useCustomer()`.

| Method | Purpose |
|--------|---------|
| `getCustomer()` | Checks `Vtex.customer.isLoggedIn` → `getCustomerProfile` → sets `customer` state |
| `getUserByEmail(email)` | Fetches checkout profile via `Vtex.cart.getClientProfileByEmail`. Cached by email in `checkoutProfile` state. |
| `customer` | Logged-in customer data |
| `checkoutProfile` | VTEX checkout profile (addresses, cards, preferences) |

### `src/providers/SnackBar.jsx`

Same pattern as other apps: `useSnackBar()` → `showSnackBar(type, message)`.

## 7. Services

### `src/services/cartService.js`

| Export | API | Notes |
|--------|-----|-------|
| `getCart()` | `Vtex.cart.getCartIfExists` | Differs from home/cart (those use `getCurrentOrCreateCart`) |
| `generateNewCart()` | `Vtex.cart.generateNewCart` | |
| `addItem(payload)` | `Vtex.cart.addItem` | |
| `startPayment(cart, payload)` | `Vtex.checkout.payV2` | Core payment call. Payload: `{ fields (card info), captchaToken, captchaSiteKey, savePersonalData, optinNewsLetter }` |
| `getUserByEmail(email)` | `Vtex.cart.getClientProfileByEmail` | Checkout profile with saved addresses/cards |
| `saveCartIdOnStorage(orderFormId)` | `Vtex.cart.saveCartIdOnStorage` | Persists cart ID from init params |
| `addUserData(userData)` | `Vtex.checkout.addUserData` | Sets customer profile on orderForm |
| `selectPaymentOption(payload)` | `Vtex.checkout.selectPaymentOption` | |
| `clearCart()` | `Vtex.cart.clearCart` | |
| `removeClientData()` | `Vtex.cart.removeClientData` + `getCart()` | |
| `removeItemFromCart(index)` | `Vtex.cart.removeItem` | |
| `cartHasCustomerData(cart)` | (local logic) | Checks `clientProfileData` has email + firstName + lastName + document + phone |
| `addLoggedCustomerToCart(customer, cart, context)` | Removes old client data, calls `context.addPersonalData` with mapped fields | |
| `getPixStatus(transactionId, paymentId)` | `Vtex.checkout.getPixStatus` | For PIX polling |
| `updateOpenTextField(cart, receiver)` | `Vtex.cart.addOpenTextFieldToCart` | Merges receiver into existing `openTextField` JSON |
| `registerToNotify(userPayload)` | `Eitri.exposedApis.session.notifyLogin` | |

### `src/services/freigthService.js` (misspelled — match existing name)

| Export | API |
|--------|-----|
| `setFreight(payload)` (default) | `Vtex.checkout.setLogisticInfo` |
| `setLogisticInfo(payload)` | Same |
| `setNewAddress(address)` | `Vtex.checkout.setLogisticInfo` with `clearAddressIfPostalCodeNotFound: false` |
| `setShippingAddress(address)` | Same, different payload shape |
| `resolvePostalCode(postalCode)` | `Vtex.cart.resolvePostalCode` |

### `src/services/CustomerService.js`

| Export | API |
|--------|-----|
| `getCustomerData()` | `Vtex.customer.isLoggedIn` → `getCustomerProfile` → returns `profile` |
| `requestLogin()` | Opens account app, returns Promise resolved on resume if logged in |
| `isLoggedIn()` | `Vtex.customer.isLoggedIn` |
| `sendAccessKeyByEmail(email)` | `Vtex.customer.sendAccessKeyByEmail` |
| `loginWithEmailAndKey(email, code)` | `Vtex.customer.loginWithEmailAndAccessKey` |

### `src/services/navigationService.js`

| Export | Purpose |
|--------|---------|
| `navigate(path, state, replace)` | `Eitri.navigation.navigate` |
| `navigateBack()` | `Eitri.navigation.back` |
| `closeEitriApp()` | `Eitri.navigation.close` |
| `goHome()` | `Eitri.exposedApis.appState.goHome` |
| `openAccount()` | Opens account app with `{ route: 'OrderList' }`, `replace: true` |
| `openCart()` | Opens cart app with `replace: true` |
| `isLoggedIn()` | `Vtex.customer.isLoggedIn` |
| `requestLogin()` | Same pattern as other apps |

### `src/services/GPayService.js`

| Export | API |
|--------|-----|
| `loadGPaymentData()` (default) | `Vtex.googlePay.loadPaymentData` |

### `src/services/Tracking.js`

| Export | Purpose |
|--------|---------|
| `trackShippingInfo(cart)` | Sends `add_shipping_info` GA event (if `autoTriggerGAEvents()` is false — otherwise VTEX service sends it automatically). Also sends Inngage `add_shipping_info` event. |

### `src/services/Recaptcha.js`

React `forwardRef` component. Renders invisible reCAPTCHA v3 button. Imperative API:
- `ref.current.getRecaptchaToken()` → executes reCAPTCHA and returns token.
- Uses `window.grecaptcha` loaded externally.

### `src/services/AppService.js`

| Export | Purpose |
|--------|---------|
| `startConfigure()` | `App.tryAutoConfigure({ verbose: false, gaVerbose: false })` |
| `autoTriggerGAEvents()` | Returns `App.configs.appConfigs.autoTriggerGAEvents` (default `true`) — controls whether GA events are auto-fired by VTEX service or manually by the app. |

## 8. Utils

| File | Exports | Purpose |
|------|---------|---------|
| `utils.js` | `formatAmountInCents(amount, locale?, currency?)` | Converts cents to formatted BRL string. Returns "Gratis" for 0. |
| `vtexErrorMap.js` | `ERROR_MAP` | Maps VTEX error codes to PT-BR messages. Currently only `CHK0223: 'Seu pagamento nao foi autorizado'`. |
| `paymentSystemResolver.js` | `paymentSystemResolver(cart)` | Groups `cart.paymentData.paymentSystems` by `groupName`. Enriches each with installment options (count, value, label, `hasInterestRate`). Tracks `isCurrentPaymentSystem` flag. |
| `getPaymentSystem.js` | Payment system detail resolver | Maps payment system ID to display info. |
| `verifySocialNumber.js` | CPF/CNPJ validation | Used in PersonalData for document validation. |
| `getShippingAddress.js` | `getShippingAddress(cart)` | Extracts/formats shipping address from cart's `shippingData`. |
| `getRemoteConfigStyleProperty.js` | Remote config style reader | Reads styling properties from app remote config. |
| `jsencrypt.min.js` | RSA encryption | Bundled library for credit card data encryption before `payV2`. |

## 9. Analytics

| Step | Events |
|------|--------|
| Home init | `beginCheckoutEvent(cart)` (once via `pristineRef`) |
| CheckoutReview mount | `sendScreenView('Revisao do pedido', 'CheckoutReview')` |
| Shipping selected | `trackShippingInfo(cart)` → GA `add_shipping_info` + Inngage `add_shipping_info` |
| Payment completed | `purchaseEvent(cart, orderId)` |
| Each view mount | `sendScreenView(friendlyName, fileName)` |

## 10. Gotchas

- **`freigthService.js`** — misspelled filename, matches cart app. Keep it as-is.
- **`getCart()` vs home/cart**: checkout uses `Vtex.cart.getCartIfExists` (does NOT create if missing), while home/cart use `getCurrentOrCreateCart`.
- **Gift card clearing**: `_selectPaymentOption` in LocalCart clears existing gift cards before setting new payment — prevents stale gift card state.
- **OTP flow**: VTEX returns specific error codes (CHK003, CHK0087, ORD062) when email verification is required before placing an order. The OtpLogin modal handles this inline.
- **reCAPTCHA site key**: loaded from remote config (`appConfigs.checkout.recaptchaKey`), not hardcoded.
- **`autoTriggerGAEvents`**: when true (default), VTEX service auto-fires GA events and the app skips manual firing to avoid duplicates.
- **Recaptcha.js uses raw `<button>` HTML** — exception to the eitri-luminus-only rule, required for reCAPTCHA v3 rendering.
- **CheckoutReview `isReadyToPay`**: requires `cart.shippingData.address.number` to be present — will fail if address has no street number.
