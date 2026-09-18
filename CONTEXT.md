# Eitri Shopping (VTEX Commerce Domain)

Shared vocabulary for the VTEX commerce domain used across the `home`, `account`, `checkout`, `pdp`, and `cart` apps in this bundle. This glossary is separate from `AGENTS.md`'s code-duplication policy: the domain is one shared concept even though each app keeps its own duplicated types/services for independent buildability.

## Language

**Shipping**:
The process of getting cart items to the customer — selecting a delivery method (home delivery or pickup point) and quoting/calculating its cost via VTEX's logistics simulation. Matches VTEX's own API vocabulary (`shippingData`, `logisticsInfo`).
_Avoid_: Freight — this is UI-layer naming drift (view files across `checkout`, `cart`, and `pdp` are named `Freight*`/`freightService`), not a distinct concept. New code (interfaces, props, functions) uses "Shipping"; existing `Freight*`-named files are not renamed as part of the TS migration — that's a separate follow-up.

**Pickup Point**:
A physical store location a customer can select as a Shipping option instead of home delivery, flagged by `isPickupInPoint` on a shipping option and described by VTEX's `pickupStoreInfo` (address, `friendlyName`). Not a separate flow from Shipping — it's one of its two delivery channels, the other being home delivery to an Address.
_Avoid_: Pickup Store, Store Pickup

**Bonus**:
A cashback/store-credit balance the customer earns on completed VTEX orders and can redeem against a future purchase, sourced from an external cashback gateway (not VTEX) via `account`'s `BonusService`/`BonusExtractService`. A **Movement** (`MOVEMENT_TYPE`: `received`/`redeemed`/`special`) is one line of the customer's **Statement** ("extrato") — the redeemable side of a Movement can be flagged `expiring`/`expired`/`pending` (`MOVEMENT_STATUS`), distinct from the order/payment status of the VTEX order that generated it. Redemption itself happens outside this app, in the gateway's own white-labeled wallet (opened in-browser, never inside the app — a separate identity/auth from the VTEX login). `checkout` stamps a cross-app cache-invalidation flag on order completion so `account`'s cached balance/statement refreshes on the next visit.
_Avoid_: Cashback (the underlying mechanism, but customer-facing copy and this app's code call it "Bônus"/"Meu Bônus" — use that term in new code, not "cashback"), Wallet (that's the external gateway's own UI, not a concept inside this app).

**Biometric Login**:
A silent, automatic sign-in attempt using device-stored VTEX credentials (email/password) via the device's fingerprint/face unlock, made once per app session (`account`/`shared`'s `useBiometricLogin` hook) as soon as the app determines the customer isn't already logged in. Distinct from three related-but-separate moments in the same flow:
- **Biometric Save**: after a successful *manual* email/password sign-in, `account/SignIn.tsx` offers (via `BiometricSaveModal`) to store those credentials for future Biometric Login attempts.
- **Biometric Reauth**: when a Biometric Login attempt runs but the stored credentials no longer authenticate (e.g. the customer changed their password elsewhere), `BiometricReauthModal` prompts for the current password to re-save fresh credentials — this is a *repair* step, not a new login method.
- **Biometric availability**: a device/OS capability check (`BiometricService.isBiometricAvailable`), independent of whether credentials happen to be saved yet.
_Avoid_: "Biometric auth" as a catch-all — always say which of the three moments above is meant, since they trigger different UI and different service calls.

**CMS Section** vs **CMS Component**:
Two distinct, currently-coexisting mechanisms for rendering CMS-driven content blocks on the storefront — do not conflate them:
- **CMS Component** (legacy): a `.tsx` component under `home/src/components/CmsComponents/`, resolved by string `name` in `home/src/utils/getMappedComponent.tsx`, receiving nested `props.data`. This is what every `home` CMS block used until the Deco sections model landed.
- **CMS Section** (current, Deco-native): a typed `.tsx` file under `shared/src/sections/`, resolved by `__resolveType` in `shared/src/utils/resolveSection.ts`, receiving flattened top-level props, and read by the Deco CMS editor to build its admin form. New CMS blocks are authored as Sections, not Components.
Both trees currently render live content in parallel (see `AGENTS.md`'s "Deco CMS Sections" section) — whether/when `home` migrates onto Sections entirely is an open product decision, not yet made.
_Avoid_: "CMS block" as a stand-in for either — say Section or Component specifically once code is involved, since they have different prop shapes and registration mechanisms.
