# Eventos Salesforce — TrackingService

Todos os eventos Salesforce disparados via `TrackingService.sendSalesforceEvent()` em
`eitri-shopping-template-vtex-deco-shared/src/services/TrackingService.js`.

## Catálogo de Eventos

| Nome do Evento | Chaves dos Dados | Chamado por |
|---------------|------------------|-------------|
| `screen_view` | `screen_name`, `screen_class` | `sendScreenView` |
| `ad_impression` | achatado via `_flattenForSalesforce(data)` | `adImpressionEvent` |
| `add_payment_info` | `currency`, `payment_type`, `value`, `items_count` | `addPaymentInfoEvent` |
| `add_shipping_info` | `currency`, `value`, `shipping_tier`, `items_count` | `addShippingInfoEvent` |
| `add_to_cart` | `currency`, `value`, `item_id`, `item_name`, `item_brand` | `addToCartEvent` |
| `add_to_wishlist` | `item_id`, `item_name`, `currency`, `value` (condicional) | `addToWishlistEvent` |
| `begin_checkout` | `currency`, `value`, `coupon`, `items_count`, `item_ids` | `beginCheckoutEvent` |
| `login` | `method` | `loginEvent` |
| `purchase` | `currency`, `value`, `transaction_id`, `shipping`, `coupon`, `items_count`, `item_ids`, `item_names` | `purchaseEvent` |
| `remove_from_cart` | `currency`, `value`, `item_id`, `item_name`, `quantity` | `removeFromCartEvent` |
| `search` | `search_term` | `searchEvent` |
| `select_content` | achatado via `_flattenForSalesforce(data)` | `selectContentEvent` |
| `select_item` | achatado via `_flattenForSalesforce(data)` | `selectItemEvent` |
| `select_promotion` | achatado via `_flattenForSalesforce(data)` | `selectPromotionEvent` |
| `share` | `item_id` | `shareEvent` |
| `sign_up` | `method` (condicional) | `signUpEvent` |
| `view_cart` | `currency`, `value`, `items_count`, `item_ids` | `viewCartEvent` |
| `view_item` | `currency`, `value`, `item_id`, `item_name`, `item_brand` | `viewItemEvent` |
| `view_item_list` | achatado via `_flattenForSalesforce(data)` | `viewItemListEvent` |
| `view_promotion` | achatado via `_flattenForSalesforce(data)` | `viewPromotionEvent` |
| `view_search_results` | achatado via `_flattenForSalesforce(data)` | `viewSearchResultsEvent` |

**21 chamadas no total.**

## Observações

- **Payloads planos apenas**: o Salesforce não suporta objetos aninhados nem arrays. Os eventos ou constroem payloads planos explicitamente ou usam `_flattenForSalesforce()`, que remove valores não-primitivos.
- **Redução de arrays**: onde o GA4 envia arrays completos de `items[]`, o equivalente Salesforce os reduz a `items_count` (número) e `item_ids` / `item_names` (strings separadas por vírgula).
- **Carregamento lazy**: o módulo Salesforce é carregado uma única vez via `Eitri.modules()` no primeiro uso (linha 12) e a promise é cacheada em `_sfModulePromise`.
- **Eventos achatados** (5 de 21): `ad_impression`, `select_content`, `select_item`, `select_promotion`, `view_item_list`, `view_promotion`, `view_search_results` — o formato do payload depende do que o chamador passa, filtrado apenas para valores primitivos.
