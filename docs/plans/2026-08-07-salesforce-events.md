# Salesforce Marketing Cloud Events Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add Salesforce Marketing Cloud (SFMC) event tracking alongside existing GA4 and Insider events in the shared `TrackingService`.

**Architecture:** Salesforce is accessed via `Eitri.modules()` (async, returns `modules.salesforce.logEvent`), unlike GA (`Eitri.exposedApis.fb`) and Insider (`Eitri.exposedApis.insider`). Its `logEvent` accepts only `Record<string, string | number | boolean>` — no arrays or nested objects. Each existing TrackingService method gets a Salesforce block that flattens the event data into primitives. The module reference is cached after first resolution to avoid repeated async lookups.

**Tech Stack:** eitri-bifrost (`Eitri.modules()`), existing `TrackingService` class in `eitri-shopping-template-vtex-deco-shared`.

**Key Constraint:** SFMC `data` values must be `string | number | boolean` only. GA events use `items[]` arrays — these must be flattened for SFMC (e.g. first item fields inlined, or item IDs joined as comma-separated string for multi-item events).

**Prerequisite:** The native app must have `salesforce` configuration enabled. The code must gracefully no-op when the module is unavailable.

---

### Task 1: Add Salesforce base infrastructure to TrackingService

**Files:**
- Modify: `eitri-shopping-template-vtex-deco-shared/src/services/TrackingService.js:1-8`

**Step 1: Add cached module resolver and base send method**

Add these static members after the `_logInTerminal` method (after line 8):

```js
static _sfModulePromise = null

static _getSfLogEvent = async () => {
    if (!TrackingService._sfModulePromise) {
        TrackingService._sfModulePromise = Eitri.modules()
            .then(modules => modules?.salesforce?.logEvent ?? null)
            .catch(() => null)
    }
    return TrackingService._sfModulePromise
}

static sendSalesforceEvent = async (eventName, data = {}) => {
    try {
        const logEvent = await TrackingService._getSfLogEvent()
        if (!logEvent) return
        await logEvent({ eventName, data })
        TrackingService._logInTerminal('Salesforce', eventName, data)
    } catch (error) {
        console.error('[Salesforce] Error on', eventName, error)
    }
}
```

**Step 2: Verify syntax**

Run: `npx --no-install esbuild eitri-shopping-template-vtex-deco-shared/src/services/TrackingService.js --jsx=automatic --bundle=false --format=esm > /dev/null`
Expected: No errors.

**Step 3: Commit**

```bash
git add eitri-shopping-template-vtex-deco-shared/src/services/TrackingService.js
git commit -m "feat(tracking): add Salesforce base infrastructure to TrackingService"
```

---

### Task 2: Add Salesforce to single-product events (view_item, add_to_cart, share, add_to_wishlist)

**Files:**
- Modify: `eitri-shopping-template-vtex-deco-shared/src/services/TrackingService.js`

These events deal with a single product. Flatten to primitive fields.

**Step 1: Add Salesforce block to `addToCartEvent` (after the Insider try/catch, ~line 203)**

```js
// Salesforce
try {
    const item = this._resolveGAProductMetadata(product)
    TrackingService.sendSalesforceEvent('add_to_cart', {
        currency: 'BRL',
        value: item.price || 0,
        item_id: item.item_id || '',
        item_name: item.item_name || '',
        item_brand: item.item_brand || ''
    })
} catch (e) {
    console.error('[Salesforce] Error on add_to_cart', e)
}
```

**Step 2: Add Salesforce block to `viewItemEvent` (after the Insider try/catch, ~line 459)**

```js
// Salesforce
try {
    const item = this._resolveGAProductMetadata(product)
    TrackingService.sendSalesforceEvent('view_item', {
        currency: 'BRL',
        value: item.price || 0,
        item_id: item.item_id || '',
        item_name: item.item_name || '',
        item_brand: item.item_brand || ''
    })
} catch (e) {
    console.error('[Salesforce] Error on view_item', e)
}
```

**Step 3: Add Salesforce block to `addToWishlistEvent` (replace one-liner at ~line 210)**

Change from:
```js
static addToWishlistEvent = async data => TrackingService.sendRecommendedGaEvent('add_to_wishlist', data)
```
To:
```js
static addToWishlistEvent = async data => {
    TrackingService.sendRecommendedGaEvent('add_to_wishlist', data)

    // Salesforce
    try {
        const sfData = {}
        if (data?.items?.[0]) {
            sfData.item_id = data.items[0].item_id || ''
            sfData.item_name = data.items[0].item_name || ''
        }
        if (data?.currency) sfData.currency = data.currency
        if (data?.value != null) sfData.value = data.value
        TrackingService.sendSalesforceEvent('add_to_wishlist', sfData)
    } catch (e) {
        console.error('[Salesforce] Error on add_to_wishlist', e)
    }
}
```

**Step 4: Add Salesforce block to `shareEvent` (after the GA call, ~line 383)**

Change from:
```js
static shareEvent = async itemId => {
    TrackingService.sendRecommendedGaEvent('share', {
        item_id: itemId
    })
}
```
To:
```js
static shareEvent = async itemId => {
    TrackingService.sendRecommendedGaEvent('share', { item_id: itemId })

    // Salesforce
    TrackingService.sendSalesforceEvent('share', { item_id: itemId || '' })
}
```

**Step 5: Verify syntax**

Run: `npx --no-install esbuild eitri-shopping-template-vtex-deco-shared/src/services/TrackingService.js --jsx=automatic --bundle=false --format=esm > /dev/null`

**Step 6: Commit**

```bash
git add eitri-shopping-template-vtex-deco-shared/src/services/TrackingService.js
git commit -m "feat(tracking): add Salesforce events for view_item, add_to_cart, share, add_to_wishlist"
```

---

### Task 3: Add Salesforce to cart events (view_cart, remove_from_cart)

**Files:**
- Modify: `eitri-shopping-template-vtex-deco-shared/src/services/TrackingService.js`

These events involve cart data with multiple items. Flatten by joining item IDs and summarizing.

**Step 1: Add Salesforce block to `removeFromCartEvent` (after the Insider try/catch, ~line 340)**

```js
// Salesforce
try {
    const item = this._resolveGACartItemMetadata(itemRemoved)
    TrackingService.sendSalesforceEvent('remove_from_cart', {
        currency: 'BRL',
        value: item.price || 0,
        item_id: item.item_id || '',
        item_name: item.item_name || '',
        quantity: item.quantity || 1
    })
} catch (e) {
    console.error('[Salesforce] Error on remove_from_cart', e)
}
```

Note: `itemRemoved` is already declared in outer scope at line 314. Use it directly.

**Step 2: Add Salesforce block to `viewCartEvent` (after the Insider try/catch, ~line 428)**

```js
// Salesforce
try {
    const totalizer = cart?.totalizers?.find(i => i.id === 'Items')
    const sfValue = totalizer?.value ? totalizer.value / 100 : cart.value ? cart.value / 100 : 0
    TrackingService.sendSalesforceEvent('view_cart', {
        currency: 'BRL',
        value: sfValue,
        items_count: cart.items?.length || 0,
        item_ids: cart.items?.map(i => i.productId).join(',') || ''
    })
} catch (e) {
    console.error('[Salesforce] Error on view_cart', e)
}
```

**Step 3: Verify syntax**

Run: `npx --no-install esbuild eitri-shopping-template-vtex-deco-shared/src/services/TrackingService.js --jsx=automatic --bundle=false --format=esm > /dev/null`

**Step 4: Commit**

```bash
git add eitri-shopping-template-vtex-deco-shared/src/services/TrackingService.js
git commit -m "feat(tracking): add Salesforce events for view_cart, remove_from_cart"
```

---

### Task 4: Add Salesforce to checkout events (begin_checkout, add_shipping_info, add_payment_info)

**Files:**
- Modify: `eitri-shopping-template-vtex-deco-shared/src/services/TrackingService.js`

**Step 1: Add Salesforce block to `beginCheckoutEvent` (after the GA try/catch, ~line 229)**

```js
// Salesforce
try {
    const totalizer = cart?.totalizers?.find(i => i.id === 'Items')
    const sfValue = totalizer?.value ? totalizer.value / 100 : cart.value ? cart.value / 100 : 0
    TrackingService.sendSalesforceEvent('begin_checkout', {
        currency: 'BRL',
        value: sfValue,
        coupon: cart.marketingData?.coupon || '',
        items_count: cart.items?.length || 0,
        item_ids: cart.items?.map(i => i.productId).join(',') || ''
    })
} catch (e) {
    console.error('[Salesforce] Error on begin_checkout', e)
}
```

**Step 2: Add Salesforce block to `addShippingInfoEvent` (after the GA try/catch, ~line 171)**

```js
// Salesforce
try {
    let shippingSelected = cart?.shippingData?.logisticsInfo?.map(item => item.selectedSla)
    const uniqueSla = [...new Set(shippingSelected)]
    const totalItemPrice = cart.totalizers.find(item => item.id === 'Items')?.value / 100

    TrackingService.sendSalesforceEvent('add_shipping_info', {
        currency: cart?.storePreferencesData?.currencyCode || 'BRL',
        value: totalItemPrice || 0,
        shipping_tier: uniqueSla.join(';'),
        items_count: cart.items?.length || 0
    })
} catch (e) {
    console.error('[Salesforce] Error on add_shipping_info', e)
}
```

**Step 3: Add Salesforce block to `addPaymentInfoEvent` (after the GA try/catch, before the closing catch at ~line 135)**

```js
// Salesforce
try {
    TrackingService.sendSalesforceEvent('add_payment_info', {
        currency: 'BRL',
        payment_type: paymentType || '',
        value: value || 0,
        items_count: cart.items?.length || 0
    })
} catch (e) {
    console.error('[Salesforce] Error on add_payment_info', e)
}
```

Note: `paymentType` and `value` are already computed in the outer scope of this method.

**Step 4: Verify syntax**

Run: `npx --no-install esbuild eitri-shopping-template-vtex-deco-shared/src/services/TrackingService.js --jsx=automatic --bundle=false --format=esm > /dev/null`

**Step 5: Commit**

```bash
git add eitri-shopping-template-vtex-deco-shared/src/services/TrackingService.js
git commit -m "feat(tracking): add Salesforce events for begin_checkout, add_shipping_info, add_payment_info"
```

---

### Task 5: Add Salesforce to purchase event

**Files:**
- Modify: `eitri-shopping-template-vtex-deco-shared/src/services/TrackingService.js`

This is the most critical SFMC event for marketing journeys.

**Step 1: Add Salesforce block to `purchaseEvent` (after the Insider try/catch, ~line 306)**

```js
// Salesforce
try {
    const shippingPrice = cart.totalizers.find(item => item.id === 'Shipping')?.value / 100
    const coupon = cart?.marketingData?.coupon || ''

    TrackingService.sendSalesforceEvent('purchase', {
        currency: 'BRL',
        value: cart?.value && cart.value > 0 ? cart.value / 100 : 0,
        transaction_id: orderId || '',
        shipping: shippingPrice || 0,
        coupon: coupon,
        items_count: cart.items?.length || 0,
        item_ids: cart.items?.map(i => i.productId).join(',') || '',
        item_names: cart.items?.map(i => i.name).join(',') || ''
    })
} catch (e) {
    console.error('[Salesforce] Error on purchase', e)
}
```

**Step 2: Verify syntax**

Run: `npx --no-install esbuild eitri-shopping-template-vtex-deco-shared/src/services/TrackingService.js --jsx=automatic --bundle=false --format=esm > /dev/null`

**Step 3: Commit**

```bash
git add eitri-shopping-template-vtex-deco-shared/src/services/TrackingService.js
git commit -m "feat(tracking): add Salesforce event for purchase"
```

---

### Task 6: Add Salesforce to auth and search events (login, sign_up, search)

**Files:**
- Modify: `eitri-shopping-template-vtex-deco-shared/src/services/TrackingService.js`

These events already have flat primitive data, so no flattening needed.

**Step 1: Add Salesforce to `loginEvent` (after the Insider call, ~line 241)**

```js
// Salesforce
TrackingService.sendSalesforceEvent('login', { method: method || '' })
```

**Step 2: Add Salesforce to `signUpEvent` (replace one-liner ~line 389)**

Change from:
```js
static signUpEvent = async data => TrackingService.sendRecommendedGaEvent('sign_up', data)
```
To:
```js
static signUpEvent = async data => {
    TrackingService.sendRecommendedGaEvent('sign_up', data)

    // Salesforce
    try {
        const sfData = {}
        if (data?.method) sfData.method = data.method
        TrackingService.sendSalesforceEvent('sign_up', sfData)
    } catch (e) {
        console.error('[Salesforce] Error on sign_up', e)
    }
}
```

**Step 3: Add Salesforce to `searchEvent` (after the GA call, ~line 351)**

Change from:
```js
static searchEvent = async term => {
    TrackingService.sendRecommendedGaEvent('search', {
        search_term: term
    })
}
```
To:
```js
static searchEvent = async term => {
    TrackingService.sendRecommendedGaEvent('search', { search_term: term })

    // Salesforce
    TrackingService.sendSalesforceEvent('search', { search_term: term || '' })
}
```

**Step 4: Verify syntax**

Run: `npx --no-install esbuild eitri-shopping-template-vtex-deco-shared/src/services/TrackingService.js --jsx=automatic --bundle=false --format=esm > /dev/null`

**Step 5: Commit**

```bash
git add eitri-shopping-template-vtex-deco-shared/src/services/TrackingService.js
git commit -m "feat(tracking): add Salesforce events for login, sign_up, search"
```

---

### Task 7: Add Salesforce to remaining list/promo events (select_item, select_promotion, view_item_list, view_promotion, select_content, view_search_results, ad_impression)

**Files:**
- Modify: `eitri-shopping-template-vtex-deco-shared/src/services/TrackingService.js`

These are all one-liner passthrough methods. They receive generic `data` objects from callers. Since we can't guarantee `data` shape is SFMC-compatible (it may contain arrays), extract only known primitive fields.

**Step 1: Create a helper to extract SFMC-safe fields from generic GA data**

Add after `sendSalesforceEvent` method:

```js
static _flattenForSalesforce = (data = {}) => {
    const result = {}
    for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
            result[key] = value
        }
    }
    return result
}
```

**Step 2: Update each one-liner method to add Salesforce**

For `selectContentEvent` (~line 357):
```js
static selectContentEvent = async data => {
    TrackingService.sendRecommendedGaEvent('select_content', data)
    TrackingService.sendSalesforceEvent('select_content', TrackingService._flattenForSalesforce(data))
}
```

For `selectItemEvent` (~line 363):
```js
static selectItemEvent = async data => {
    TrackingService.sendRecommendedGaEvent('select_item', data)
    TrackingService.sendSalesforceEvent('select_item', TrackingService._flattenForSalesforce(data))
}
```

For `selectPromotionEvent` (~line 369):
```js
static selectPromotionEvent = async data => {
    try {
        TrackingService.sendRecommendedGaEvent('select_promotion', data)
        TrackingService.sendSalesforceEvent('select_promotion', TrackingService._flattenForSalesforce(data))
    } catch (e) {}
}
```

For `viewItemListEvent` (~line 466):
```js
static viewItemListEvent = async data => {
    TrackingService.sendRecommendedGaEvent('view_item_list', data)
    TrackingService.sendSalesforceEvent('view_item_list', TrackingService._flattenForSalesforce(data))
}
```

For `viewPromotionEvent` (~line 472):
```js
static viewPromotionEvent = async data => {
    TrackingService.sendRecommendedGaEvent('view_promotion', data)
    TrackingService.sendSalesforceEvent('view_promotion', TrackingService._flattenForSalesforce(data))
}
```

For `viewSearchResultsEvent` (~line 478):
```js
static viewSearchResultsEvent = async data => {
    TrackingService.sendRecommendedGaEvent('view_search_results', data)
    TrackingService.sendSalesforceEvent('view_search_results', TrackingService._flattenForSalesforce(data))
}
```

For `adImpressionEvent` (~line 101):
```js
static adImpressionEvent = async data => {
    TrackingService.sendRecommendedGaEvent('ad_impression', data)
    TrackingService.sendSalesforceEvent('ad_impression', TrackingService._flattenForSalesforce(data))
}
```

**Step 3: Verify syntax**

Run: `npx --no-install esbuild eitri-shopping-template-vtex-deco-shared/src/services/TrackingService.js --jsx=automatic --bundle=false --format=esm > /dev/null`

**Step 4: Commit**

```bash
git add eitri-shopping-template-vtex-deco-shared/src/services/TrackingService.js
git commit -m "feat(tracking): add Salesforce events for list, promo, and content events"
```

---

### Task 8: Add Salesforce to screen view

**Files:**
- Modify: `eitri-shopping-template-vtex-deco-shared/src/services/TrackingService.js`

**Step 1: Add Salesforce to `sendScreenView` (~line 84)**

Change from:
```js
static sendScreenView = async (friendlyScreenName, screenFilename) => {
    Eitri.exposedApis.fb.currentScreen({ screen: friendlyScreenName, screenClass: screenFilename })
}
```
To:
```js
static sendScreenView = async (friendlyScreenName, screenFilename) => {
    Eitri.exposedApis.fb.currentScreen({ screen: friendlyScreenName, screenClass: screenFilename })

    // Salesforce
    TrackingService.sendSalesforceEvent('screen_view', {
        screen_name: friendlyScreenName || '',
        screen_class: screenFilename || ''
    })
}
```

**Step 2: Verify syntax**

Run: `npx --no-install esbuild eitri-shopping-template-vtex-deco-shared/src/services/TrackingService.js --jsx=automatic --bundle=false --format=esm > /dev/null`

**Step 3: Commit**

```bash
git add eitri-shopping-template-vtex-deco-shared/src/services/TrackingService.js
git commit -m "feat(tracking): add Salesforce event for screen_view"
```

---

## Summary of all Salesforce events

| GA4 Event | SFMC Data Shape (all primitives) |
|---|---|
| `screen_view` | `screen_name`, `screen_class` |
| `view_item` | `currency`, `value`, `item_id`, `item_name`, `item_brand` |
| `add_to_cart` | `currency`, `value`, `item_id`, `item_name`, `item_brand` |
| `remove_from_cart` | `currency`, `value`, `item_id`, `item_name`, `quantity` |
| `add_to_wishlist` | `currency`, `value`, `item_id`, `item_name` |
| `share` | `item_id` |
| `view_cart` | `currency`, `value`, `items_count`, `item_ids` |
| `begin_checkout` | `currency`, `value`, `coupon`, `items_count`, `item_ids` |
| `add_shipping_info` | `currency`, `value`, `shipping_tier`, `items_count` |
| `add_payment_info` | `currency`, `payment_type`, `value`, `items_count` |
| `purchase` | `currency`, `value`, `transaction_id`, `shipping`, `coupon`, `items_count`, `item_ids`, `item_names` |
| `login` | `method` |
| `sign_up` | `method` |
| `search` | `search_term` |
| `select_content` | flattened primitives from caller data |
| `select_item` | flattened primitives from caller data |
| `select_promotion` | flattened primitives from caller data |
| `view_item_list` | flattened primitives from caller data |
| `view_promotion` | flattened primitives from caller data |
| `view_search_results` | flattened primitives from caller data |
| `ad_impression` | flattened primitives from caller data |

## Important notes

- **No consumer app changes needed.** All Salesforce calls are added inside `TrackingService` methods in shared. Consumer apps (home, pdp, cart, checkout, account) already call these methods.
- **Graceful degradation.** If `salesforce` module is not configured in native app, `_getSfLogEvent()` returns `null` and all SF events silently no-op.
- **Module caching.** `Eitri.modules()` is called only once; the promise is cached in `_sfModulePromise`.
- **Data safety.** `_flattenForSalesforce` strips any non-primitive values. Explicit event methods build their own flat objects.
