# BannerWithShelf Image Mode Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a `mode` toggle to the existing `BannerWithShelf` CMS section so it can render either the existing `ShelfOfProductsSlider` (`mode='scroll'`, default) or a new `ProductImageShelf` component (`mode='images'`) that shows only product images in a horizontal scroll — no card chrome, no price, no title.

**Architecture:** Mirror the pattern in `ProductShelf.jsx` → `ShelfOfProducts.jsx`: `BannerWithShelf` passes `mode={data.mode || 'scroll'}` and conditionally renders `ShelfOfProductsSlider` or the new `ProductImageShelf`. `ProductImageShelf` is a thin horizontal-scroll shelf that renders one `Image` per product (source: `product.items?.[0]?.images?.[0]?.imageUrl`), each tappable via `openProduct(product)`. No new CMS section, no new `getMappedComponent.js` entry.

**Tech Stack:** React, eitri-luminus (`View`, `Image`), `openProduct` from `NavigationService`, Tailwind CSS.

---

### Task 1: Create `ProductImageShelf` component

Horizontal scroll shelf of product images only. Same scroll container pattern as `ShelfOfProductsSlider` but items are plain images instead of `ProductCard`.

**Files:**
- Create: `eitri-shopping-template-vtex-deco-home/src/components/CmsComponents/BannerWithShelf/ProductImageShelf.jsx`
- Reference for scroll container pattern: `eitri-shopping-template-vtex-deco-home/src/components/ShelfOfProducts/components/ShelfOfProductsSlider.jsx`

**Key facts:**
- Product image URL: `product.items?.[0]?.images?.[0]?.imageUrl`
- Navigation: `openProduct(product)` from `'../../../services/NavigationService'`
- Item width: `min-w-[33vw]` — shows ~3 items with the 3rd partially cropped as scroll hint
- No horizontal padding on the scroll container (images start flush with screen edge)
- No `SliderPagination` — keep it simple
- Loading skeleton: 3 `animate-pulse bg-gray-200` boxes

**Step 1: Create the file**

```jsx
import { View, Image } from 'eitri-luminus'
import { openProduct } from '../../../services/NavigationService'

export default function ProductImageShelf({ products, isLoading }) {
	if (isLoading) {
		return (
			<View className='flex overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'>
				<View className='flex gap-[2px]'>
					{[0, 1, 2].map(i => (
						<View key={i} className='min-w-[33vw] aspect-square bg-gray-200 animate-pulse' />
					))}
				</View>
			</View>
		)
	}

	return (
		<View className='flex overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'>
			<View className='flex gap-[2px]'>
				{products?.map(product => {
					const imageUrl = product.items?.[0]?.images?.[0]?.imageUrl
					return (
						<View
							key={product.productId}
							className='min-w-[33vw] aspect-square'
							onClick={() => openProduct(product)}>
							<Image
								src={imageUrl}
								className='w-full h-full'
							/>
						</View>
					)
				})}
			</View>
		</View>
	)
}
```

**Step 2: Commit**

```bash
git add eitri-shopping-template-vtex-deco-home/src/components/CmsComponents/BannerWithShelf/ProductImageShelf.jsx
git commit -m "feat: add ProductImageShelf component"
```

---

### Task 2: Update `BannerWithShelf.jsx` to support `mode`

Add the `ProductImageShelf` import and conditionally render based on `data.mode || 'scroll'`.

**Files:**
- Modify: `eitri-shopping-template-vtex-deco-home/src/components/CmsComponents/BannerWithShelf/BannerWithShelf.jsx`

**Step 1: Add import**

After the `ShelfOfProductsSlider` import (line 6), add:
```js
import ProductImageShelf from './ProductImageShelf'
```

**Step 2: Replace the `<ShelfOfProductsSlider>` render**

Replace:
```jsx
<ShelfOfProductsSlider
    isLoading={isLoading}
    products={products}
/>
```

With:
```jsx
{(data?.mode === 'images')
    ? <ProductImageShelf isLoading={isLoading} products={products} />
    : <ShelfOfProductsSlider isLoading={isLoading} products={products} />
}
```

**Step 3: Commit**

```bash
git add eitri-shopping-template-vtex-deco-home/src/components/CmsComponents/BannerWithShelf/BannerWithShelf.jsx
git commit -m "feat: add mode toggle to BannerWithShelf (scroll | images)"
```

---

### Task 3: Add `mode` field to `BannerWithShelf` schema in `sections.json`

**Files:**
- Modify: `eitri-shopping-template-vtex-deco-home/public/cms/sections.json`

The `BannerWithShelf` schema's `properties` object ends with the `numberOfItems` entry (around line 1890–1894). Add the `mode` field after it, before the closing `}` of `properties`.

**Step 1: Add the field**

```json
"mode": {
    "title": "Modo de exibição da prateleira",
    "type": "string",
    "default": "scroll",
    "enumNames": [
        "Prateleira de produtos",
        "Somente imagens"
    ],
    "enum": [
        "scroll",
        "images"
    ]
}
```

**Step 2: Commit**

```bash
git add eitri-shopping-template-vtex-deco-home/public/cms/sections.json
git commit -m "feat: add mode field to BannerWithShelf CMS schema"
```

---

### Task 4: Visual verification

```bash
eitri app start
```

**Check `mode='scroll'` (default — must not regress):**
1. Existing `BannerWithShelf` sections on the home page still render `ShelfOfProductsSlider` correctly

**Check `mode='images'`:**
1. Temporarily hardcode `data.mode = 'images'` in `BannerWithShelf.jsx` or configure a CMS entry
2. Loading state shows 3 gray `animate-pulse` boxes
3. Loaded state shows a horizontal scroll of product images, ~3 visible at a time
4. Tapping an image opens the correct PDP
5. Remove the temporary hardcode if used
