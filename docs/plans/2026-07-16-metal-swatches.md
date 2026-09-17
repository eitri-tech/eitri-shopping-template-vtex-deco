# Metal Swatches on Product Cards (ESS-974) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Show metal-color swatches on product cards in catalog/search pages; each swatch links to a sibling product (same jewel, different metal).

**Architecture:** Metal variants at Monte Carlo are separate VTEX products linked by the `Codigo Agrupador` product specification (present in `properties[]` of every search result). After each search page loads, `ProductCatalogContent` issues ONE batched `productSearch` OR-ing all unique agrupador codes via repeated `selectedFacets` key `codigo-agrupador` (facet verified live on the store). Results are grouped by code and passed down `SearchResults → ProductCard → ProductCardFullImage`.

**Tech Stack:** Eitri (Luminus + Bifrost), VTEX Intelligent Search GraphQL via `eitri-shopping-vtex-shared`, Tailwind.

**Verified facts (2026-07-16, do not re-verify):**
- `codigo-agrupador` is a live IS facet. GraphQL test that works against `https://www.montecarlo.com.br/api/io/_v/private/graphql/v1`:
  `selectedFacets: [{key: "codigo-agrupador", value: "031259"}, {key: "codigo-agrupador", value: "017213"}]` → returns both groups (repeated keys are OR'd).
- Example group `031259`: productId 42192 (Material "Prata com Banho de Ouro Amarelo") + 42189 ("Prata com banho de Ouro Rosé").
- A page of 12 rings had 7 unique codes; group sizes 2–6. `to: 99` is enough headroom.
- SKU-level `items[].variations` is ring size only; metal/stone never vary within a product.
- Materials seen: `Prata`, `Prata com Banho de Ouro Amarelo`, `Prata com banho de Ouro Rosé`. Beware: "Prata com Banho de Ouro Rosé" contains all three keywords — match order must be rosé → amarelo/ouro → prata.
- No test runner in this project (Eitri app, no package.json). Pure logic is verified with `node -e`; UI manually via `eitri dev`.

---

### Task 1: Pure utils — agrupador code, metal color, grouping

**Files:**
- Create: `eitri-shopping-template-vtex-deco-home/src/utils/metalSwatches.js`

**Step 1: Write the file**

```js
export const getProductProperty = (product, propertyName) => {
	const prop = product?.properties?.find(p => p.name === propertyName)
	return prop?.values?.[0] || null
}

export const getAgrupadorCode = product => getProductProperty(product, 'Codigo Agrupador')

// Order matters: "Prata com Banho de Ouro Rosé" must resolve to rosé,
// "Prata com Banho de Ouro Amarelo" to amarelo, plain "Prata" to prata.
const METAL_COLORS = [
	{ match: /ros[eé]/i, color: '#E0A487' },
	{ match: /amarelo|ouro/i, color: '#D4AF37' },
	{ match: /prata/i, color: '#C0C0C0' }
]

export const getMetalColor = material => {
	if (!material) return '#C0C0C0'
	const found = METAL_COLORS.find(m => m.match.test(material))
	return found ? found.color : '#C0C0C0'
}

export const groupSiblingsByCode = products => {
	if (!Array.isArray(products)) return {}
	return products.reduce((acc, product) => {
		const code = getAgrupadorCode(product)
		if (!code) return acc
		if (!acc[code]) acc[code] = []
		acc[code].push(product)
		return acc
	}, {})
}
```

**Step 2: Verify the pure logic with node**

Run from repo root:

```bash
node --input-type=module -e "
import { getAgrupadorCode, getMetalColor, groupSiblingsByCode } from './eitri-shopping-template-vtex-deco-home/src/utils/metalSwatches.js'
const p = (id, code, mat) => ({ productId: id, properties: [{ name: 'Codigo Agrupador', values: [code] }, { name: 'Material', values: [mat] }] })
console.assert(getAgrupadorCode(p('1','031259','Prata')) === '031259', 'code')
console.assert(getMetalColor('Prata com banho de Ouro Rosé') === '#E0A487', 'rose')
console.assert(getMetalColor('Prata com Banho de Ouro Amarelo') === '#D4AF37', 'gold')
console.assert(getMetalColor('Prata') === '#C0C0C0', 'silver')
console.assert(getMetalColor(null) === '#C0C0C0', 'null material')
console.assert(getAgrupadorCode({}) === null, 'no props')
const g = groupSiblingsByCode([p('1','A','Prata'), p('2','A','Prata'), p('3','B','Prata'), { productId: '4', properties: [] }])
console.assert(g.A.length === 2 && g.B.length === 1 && Object.keys(g).length === 2, 'grouping')
console.log('ALL PASS')
"
```

Expected: `ALL PASS`, no assertion errors.

**Step 3: Commit**

```bash
git add eitri-shopping-template-vtex-deco-home/src/utils/metalSwatches.js
git commit -m "feat: add metal swatch utils (agrupador code, metal color, grouping)"
```

---

### Task 2: Sibling fetch service

**Files:**
- Modify: `eitri-shopping-template-vtex-deco-home/src/services/ProductService.js` (append after `getProductsService`, ~line 62)

**Step 1: Add the service function**

```js
export const getProductSiblingsService = async agrupadorCodes => {
	if (!Array.isArray(agrupadorCodes) || agrupadorCodes.length === 0) {
		return []
	}

	const options = {
		selectedFacets: agrupadorCodes.map(code => ({ key: 'codigo-agrupador', value: code })),
		from: 0,
		to: 99,
		hideUnavailableItems: true,
		options: {
			allowRedirect: false
		}
	}

	const result = await Vtex.searchGraphql.productSearch(options)
	return result?.products || []
}
```

Notes for implementer:
- No `fullText` — facets-only search is valid (verified via curl against the store).
- `hideUnavailableItems: true` matches the main search so swatches never link to unavailable products.
- `Vtex` is already imported at the top of the file.

**Step 2: Verify shape against live API (contract check, no app run needed)**

```bash
curl -s "https://www.montecarlo.com.br/api/io/_v/private/graphql/v1" -H "Content-Type: application/json" -d '{"query":"{ productSearch(selectedFacets: [{key: \"codigo-agrupador\", value: \"031259\"}], from: 0, to: 99, hideUnavailableItems: true) @context(provider: \"vtex.search-graphql\") { products { productId } } }"}' | python3 -m json.tool
```

Expected: JSON with 2 products (42192, 42189), no errors.

**Step 3: Commit**

```bash
git add eitri-shopping-template-vtex-deco-home/src/services/ProductService.js
git commit -m "feat: add batched sibling product fetch by codigo-agrupador"
```

---

### Task 3: MetalSwatches component

**Files:**
- Create: `eitri-shopping-template-vtex-deco-home/src/components/ProductCard/MetalSwatches.jsx`

**Step 1: Write the component**

```jsx
import { View } from 'eitri-luminus'
import { getProductProperty, getMetalColor } from '../../utils/metalSwatches'

export default function MetalSwatches({ currentProductId, siblings, onSwatchPress }) {
	if (!Array.isArray(siblings) || siblings.length < 2) {
		return null
	}

	return (
		<View className='flex flex-row gap-1.5 mt-1'>
			{siblings.map(sibling => {
				const isCurrent = sibling.productId === currentProductId
				const color = getMetalColor(getProductProperty(sibling, 'Material'))
				return (
					<View
						key={sibling.productId}
						onClick={e => {
							e.stopPropagation()
							if (!isCurrent && onSwatchPress) onSwatchPress(sibling)
						}}
						className={`w-4 h-4 rounded-full ${
							isCurrent ? 'border-2 border-black' : 'border border-neutral-300'
						}`}
						style={{ backgroundColor: color }}
					/>
				)
			})}
		</View>
	)
}
```

Notes:
- `siblings` includes the current product itself (the batch fetch returns the whole group); it renders as the highlighted dot.
- `< 2` guard: a group of 1 (or missing) renders nothing.
- `e.stopPropagation()` prevents triggering the card's own `onClick` (card opens its own PDP).

**Step 2: Verify it compiles**

Run `eitri dev` (or the project's usual dev command) in `eitri-shopping-template-vtex-deco-home` — no build errors. Component is not yet rendered anywhere; visual check comes in Task 6.

**Step 3: Commit**

```bash
git add eitri-shopping-template-vtex-deco-home/src/components/ProductCard/MetalSwatches.jsx
git commit -m "feat: add MetalSwatches component"
```

---

### Task 4: Optional `swatches` slot in shared ProductCardFullImage

**Files:**
- Modify: `eitri-shopping-template-vtex-deco-shared/src/components/ProductCard/ProductCardFullImage.jsx`

**Step 1: Accept and render the prop**

Add `swatches` to the destructured props (line ~36, next to `className`):

```js
	onPressOnWishlist,
	swatches,
	className
```

Render it right after the price/installments block (after the `installments` ternary, inside the `flex flex-col gap-0 mt-1` View, ~line 158):

```jsx
					{installments ? (
						<Text className='font-bold text-neutral-500 text-xs'>{installments}</Text>
					) : (
						<View className='h-[16px]' />
					)}

					{swatches}
```

Backward compatible: callers that don't pass `swatches` render `undefined` → nothing.

**Step 2: Verify**

`eitri dev` still builds; existing cards (Home shelves) render unchanged.

**Step 3: Commit**

```bash
git add eitri-shopping-template-vtex-deco-shared/src/components/ProductCard/ProductCardFullImage.jsx
git commit -m "feat: add optional swatches slot to ProductCardFullImage"
```

---

### Task 5: Wire ProductCard — `siblings` prop → swatches node

**Files:**
- Modify: `eitri-shopping-template-vtex-deco-home/src/components/ProductCard/ProductCard.jsx`

**Step 1: Accept prop and build the node**

Change the signature (line 30):

```js
export default function ProductCard({ product, siblings, className }) {
```

Add import (top of file):

```js
import MetalSwatches from './MetalSwatches'
```

Build the node just before the `params` object (~line 158):

```jsx
	const swatches = (
		<MetalSwatches
			currentProductId={product.productId}
			siblings={siblings}
			onSwatchPress={openProduct}
		/>
	)
```

Add to `params`:

```js
		onPressMainAction: handleAddToCart,
		swatches,
		className
```

Notes:
- `openProduct` is already imported from NavigationService; it accepts a full product object and opens the PDP — the sibling objects from the batch fetch are full products, so navigation is direct with no extra fetch.
- `MetalSwatches` itself returns null when `siblings` is undefined or has < 2 entries, so shelves/other callers that don't pass `siblings` are unaffected.

**Step 2: Verify**

`eitri dev` builds; Home shelves and catalog cards render as before (no swatches yet — no one passes `siblings`).

**Step 3: Commit**

```bash
git add eitri-shopping-template-vtex-deco-home/src/components/ProductCard/ProductCard.jsx
git commit -m "feat: wire siblings prop into ProductCard swatches"
```

---

### Task 6: Orchestrate sibling fetch in ProductCatalogContent + pass through SearchResults

**Files:**
- Modify: `eitri-shopping-template-vtex-deco-home/src/components/ProductCatalogContent/ProductCatalogContent.jsx`
- Modify: `eitri-shopping-template-vtex-deco-home/src/components/PageSearchComponents/SearchResults.jsx`

**Step 1: ProductCatalogContent — state, fetch, reset**

Add imports:

```js
import { useRef } from 'react'
import { getProductsService, getProductSiblingsService } from '../../services/ProductService'
import { getAgrupadorCode, groupSiblingsByCode } from '../../utils/metalSwatches'
```

(Adjust: `getProductsService` is already imported — extend that line.)

Add state + ref next to the other state declarations (~line 28):

```js
	const [siblingsByCode, setSiblingsByCode] = useState({})
	const fetchedCodesRef = useRef(new Set())
```

Add the loader function after `getProducts`:

```js
	const loadSiblings = async pageProducts => {
		try {
			const codes = [...new Set(pageProducts.map(getAgrupadorCode).filter(Boolean))]
			const newCodes = codes.filter(code => !fetchedCodesRef.current.has(code))
			if (newCodes.length === 0) return
			newCodes.forEach(code => fetchedCodesRef.current.add(code))
			const siblingProducts = await getProductSiblingsService(newCodes)
			const grouped = groupSiblingsByCode(siblingProducts)
			setSiblingsByCode(prev => ({ ...prev, ...grouped }))
		} catch (error) {
			console.error('Error loading product siblings', error)
		}
	}
```

Inside `getProducts`, on page 1 reset the cache (right after the early-return guards, before the fetch):

```js
			if (page === 1) {
				fetchedCodesRef.current = new Set()
				setSiblingsByCode({})
			}
```

And after the products are set (after `setProducts(...)`, before `setProductLoading(false)`), fire and forget — do NOT await, so cards render immediately:

```js
			loadSiblings(result.products)
```

Pass the map down (line ~164):

```jsx
				<SearchResults
					isLoading={productLoading}
					searchResults={products}
					siblingsByCode={siblingsByCode}
				/>
```

**Step 2: SearchResults — pass per-product siblings**

```js
import { getAgrupadorCode } from '../../utils/metalSwatches'
```

```js
	const { searchResults, isLoading, siblingsByCode } = props
```

```jsx
					<ProductCard
						product={product}
						siblings={siblingsByCode?.[getAgrupadorCode(product)]}
					/>
```

**Step 3: Manual E2E verification on device/emulator**

Run `eitri dev`, open the app, navigate to Joias > Anéis (or search "anel"):

- [ ] Cards render immediately; swatch dots appear shortly after (async)
- [ ] Product 42192 ("Anel com Granada e Topázio...") shows 2 dots: gold (highlighted, current) + rosé
- [ ] Tapping the rosé dot opens the PDP of product 42189 (Ametista/Ouro Rosé)
- [ ] Tapping the highlighted (current) dot does nothing
- [ ] Tapping the card itself (not a dot) still opens the card's own PDP
- [ ] Products with no group (single-product code or no `Codigo Agrupador`) show no dots
- [ ] Infinite scroll: page 2 products get swatches; network tab shows exactly 1 sibling request per page
- [ ] Changing filters/sort resets and refetches correctly
- [ ] Home shelves (which don't pass `siblings`) render unchanged

**Step 4: Commit**

```bash
git add eitri-shopping-template-vtex-deco-home/src/components/ProductCatalogContent/ProductCatalogContent.jsx eitri-shopping-template-vtex-deco-home/src/components/PageSearchComponents/SearchResults.jsx
git commit -m "feat: fetch and display metal swatch siblings in catalog (ESS-974)"
```

---

## Out of scope / known limitations

- PDP does not show metal swatches (only catalog cards). Separate ticket if desired.
- Groups where siblings share the same `Material` (e.g., code 032561 — two "Ouro Amarelo" products differing by stone) render two identical gold dots. Both are tappable and navigate correctly; visual differentiation by stone is a future enhancement.
- `ProductCatalogContent.jsx` has a pre-existing bug: it uses `useCallback` (line 48) and `Image`/`Text` without importing them (auto-injected by the Eitri build, or latent). If the build fails on these, add the missing imports from `react`/`eitri-luminus` in Task 6 and note it in the commit.
