# Seções do CMS (Deco) — Guia de referência (as-built)

> Documenta o modelo de componentização das **seções do CMS Deco** em
> `eitri-shopping-template-vtex-deco-shared/src/sections/`, para onde os componentes de CMS que
> viviam em `eitri-shopping-template-vtex-deco-home/src/components/CmsComponents/` (padrão legado)
> foram migrados. **Status: os 17 componentes do `getMappedComponent` estão migrados.**

---

## 1. Contexto — dois padrões

| | **Legado (home)** | **Deco (shared)** |
|---|---|---|
| Local | `home/src/components/CmsComponents/` | `shared/src/sections/` |
| Linguagem | `.jsx` (sem tipos) | `.tsx` (tipado — o Deco lê os tipos) |
| Formato de entrada | `props.data` (aninhado) | props **achatadas** no topo |
| Resolução | por `name` em `getMappedComponent.js` | por `__resolveType` em `resolveSection.ts` |
| Editor visual | não | sim — Deco monta o formulário a partir de `Props` + JSDoc |
| Contrato | `export default Component` | `export interface Props` **+** `export default Component` |

O legado (`getCmsContent` + `CmsContentRender` + `getMappedComponent`) ainda existe no home,
mas as **views novas usam o Deco** via `DecoCMSContentRender`.

---

## 2. Como autorar uma seção

Arquivo em `shared/src/sections/<Nome>.tsx` (subpastas permitidas, ex.: `Banners/`).

1. **`export interface Props`** — é o contrato que o Deco lê. Anote os campos com JSDoc
   (`@title`, `@description`, `@format`) para gerar o formulário do admin. Exporte
   sub-interfaces para arrays de objetos (ex.: `CategoryTab`, `BannerImage`, `ProductTileShelf`).
2. **`export default`** do componente, recebendo props **achatadas** (não `props.data`).
   Use defaults na desestruturação: `function Foo({ title, items = [] }: Props)`.
3. **Tipos compartilhados** ficam em `shared/src/sections/types.ts` (`CmsAction`, `Facet`,
   `Banner*`, além dos tipos de injeção — ver §4).
4. **Ações de clique**: importe `processActions` de `shared/src/services/ResolveCmsActions`
   e tipe os objetos de ação como `CmsAction`.

```tsx
// exemplo — shared/src/sections/CategoryGallery.tsx (resumido)
import { View, Text, Image } from 'eitri-luminus'
import { useState } from 'react'
import { processActions } from '../services/ResolveCmsActions'
import type { CmsAction } from './types'

export interface CategoryItem {
  /** @title Título */
  title?: string
  /** @title Imagem */
  imageUrl?: string
  action?: CmsAction
}
export interface CategoryTab {
  /** @title Rótulo da aba */
  label: string
  categories: CategoryItem[]
}
export interface Props {
  /** @title Título da seção */
  title?: string
  tabs?: CategoryTab[]
}

export default function CategoryGallery({ title, tabs = [] }: Props) {
  /* ... */
}
```

> **Achatamento** (fundamental): `DecoCMSContentRender` faz
> `const { __resolveType, ...props } = section` e espalha `{...props}`. Cada campo da seção
> vira uma prop de topo — **não existe `props.data`**. Compare `.deco/blocks/pages-*.json`
> (achatado) com o JSON legado da VTEX (aninhado em `data`).

---

## 3. Registro e páginas

### 3.1 Registrar a seção — `shared/src/utils/resolveSection.ts`

Importe e registre no `SECTION_MAP`, chaveado pelo `__resolveType` sem `site/sections/` e sem
extensão (ex.: `Banners/MultipleImageBanner`, `ProductShelf`). Um alias pode apontar dois
nomes para o mesmo componente (ex.: `WordPressCardList` → `BlogPostShelf`).

### 3.2 Registrar a página — `DecoCMSContentRender`

O conteúdo de página fica em `shared/.deco/blocks/pages-<Nome>.json` (formato Deco: seções
achatadas com `__resolveType`). Registre um loader em `PAGE_LOADERS` no
`DecoCMSContentRender.tsx` — o `import()` **precisa ser string literal fixa** (o bundler do
Eitri não resolve caminho montado por variável):

```ts
const PAGE_LOADERS = {
  Home: () => import('../../../.deco/blocks/pages-Home.json') as ...,
  Categories: () => import('../../../.deco/blocks/pages-Categories.json') as ...
}
```

Páginas existentes:
- **Home** → `pages-Home.json`, usada em `home/src/views/Home.jsx`.
- **Categories** → `pages-Categories.json`, usada em `home/src/views/Categories.jsx`.

O JSON de origem vem da VTEX em `https://YOUR_VTEX_ACCOUNT.myvtex.com/_v/cms/api/app-eitri/<slug>`;
a conversão para Deco é: achatar `data`, remover `id`/`name`, e adicionar
`__resolveType: "site/sections/<caminho>.tsx"`.

---

## 4. Injeção de dependências (carrinho/snackbar) — **TEMPORÁRIO**

Seções que precisam de carrinho/snackbar (`ProductShelf`/`ProductTiles`/… via `ProductCard`,
e `NewsLetter`) **não importam um provider direto**. Elas consomem hooks-proxy de
`shared/src/providers/CmsDependencies`:

```
home Home.jsx
  <DecoCMSContentRender page='Home'
       useLocalShoppingCart={useLocalShoppingCart}
       useSnackBar={useSnackBar} />
          └─ CmsDependenciesProvider (proxy, no shared)
                └─ sections → ProductCard/NewsLetter usam os proxies useLocalShoppingCart()/useSnackBar()
```

- O app **injeta** seus hooks no `DecoCMSContentRender`; ele os repassa via
  `CmsDependenciesProvider` (uma vez, **sem prop-drilling**).
- Fallback no-op: sem injeção, as seções renderizam sem quebrar (sem interação de carrinho).
- O Eitri **auto-encapsula** os providers de `src/providers/` do app, então os hooks
  injetados já têm contexto real.
- **Evolução planejada:** cada app declara um `src/providers/__main__.jsx` (MainProvider —
  https://docs.eitri.tech/en/concepts/eitri-app/#mainprovider) montando os providers do
  shared; então o proxy pode ser removido. Procure os comentários `TEMPORÁRIO`.

Os providers canônicos (`CartProvider`/`SnackBarProvider`) e seus hooks estão no shared
(`providers/LocalCart`, `providers/SnackBar`) e exportados no `export.js`.

---

## 5. Infra portada para o shared

Tudo em TypeScript (services/utils/hooks em `.ts`; componentes/seções em `.tsx`):

- **Services:** `ProductService` (`getProductsService`, `getProductById`, `getCategoryTree`,
  `getProductsFacetsService`, `getProductSiblingsService`), `CartService`, `CustomerService`,
  `NavigationService`, `ResolveCmsActions` (`processActions`), `VtexAdsService`,
  `helpers/resolveSortParam`.
- **Providers:** `LocalCart` (`CartProvider`/`useLocalShoppingCart`), `SnackBar`
  (`SnackBarProvider`/`useSnackBar`), `CmsDependencies` (proxy — §4).
- **Componentes:** `ProductCard` (+ `MetalSwatches`, `productCard.hooks`, `productCard.utils`),
  `ShelfOfProducts` (+ Carousel/Slider), `SectionTitle`, `SearchResults`, `InfiniteScroll`,
  `CustomModal`, `ProductCatalogContent` (+ `CatalogFilter`/`CatalogSort`/`PriceRange`).
- **Utils/tipos:** `utils/price` (`formatPrice`), `utils/lists` (`LIST_ORDERING`),
  `sections/types.ts`, `types/product.ts` (domínio VTEX: `Product`/`Sku`/`Seller`/`Cart`…).

---

## 6. Convenções e gotchas

- **Split por tipo:** services/utils/hooks/tipos → `.ts`; componentes/seções → `.tsx`.
- **TS funciona fora de `src/sections/`** também (ex.: `DecoCMSContentRender.tsx`), mas os
  **imports de componentes devem ser explícitos** — o auto-import do Eitri (ts-morph) pode
  colidir se a tag for usada sem import.
- **Sem `style` prop** (regra do `.aiconfig`: use Tailwind/DaisyUI + props `width/height`).
  Exceção pragmática: valores genuinamente dinâmicos que não viram classe (cor hex vinda do
  CMS em `MetalSwatches`/`HighlightedProductShelf`; posições de slider em `PriceRange`).
- **Imports de React explícitos** — o legado usava `useState`/`useEffect`/`View` como globais;
  em `.tsx` precisam ser importados.
- **Validação rápida de sintaxe:** `npx --no-install esbuild <arquivo> --jsx=automatic`.

---

## 7. Sincronizar com o time paralelo

O outro time evolui os componentes legados no home. Para trazer as mudanças sem sobrescrever
a tipagem, use `shared/scripts/section-sync/sync.mjs` (baseado em git):
`status` / `scan` / `diff <key>` / `log <key>` / `bump <key|all>`, com `--against <ref>` para
comparar contra uma branch (ex.: `origin/feat/...`). Cada seção tem seu baseline no
`manifest.json`. Ver `scripts/section-sync/README.md`.

---

## 8. Inventário — 17/17 migradas

| Seção (`__resolveType` key) | Origem no home | Notas |
|---|---|---|
| `OverHeader` | OverHeader | barra fixa + copiar cupom |
| `Banners/MultipleImageBanner` | Banner | dispatcher por `mode` (+ SliderHero/BannerList/…); `FullScreen`→SliderHero |
| `CategoryGallery` | CategoryGallery | abas + grid |
| `CategoryListSwipe` | CategoryListSwipe | painel deslizante de subcategorias (página Categories) |
| `ProductShelf` | ProductShelf | prateleira; `ProductService` + `ShelfOfProducts` |
| `Experiences` | Experiences | grid 2 col + mapa de ícones |
| `NewsLetter` | NewsLetter | `NewsletterService` + `useSnackBar` (injetado) |
| `ProductTiles` | ProductTiles | abas de shelves com cache |
| `HighlightedProductShelf` | HighlightedProductShelf | shelf com countdown; cores dinâmicas |
| `CategoryTree` | CategoryTree | tabs + `ListWithImages`/`SimpleList` |
| `CategoryAccordion` | CategoryAccordion | acordeão; `GenericBox` |
| `RichText` | RichText | parser Draft.js → Luminus |
| `VtexAdsBanner` | VtexAdsBanner | NewTail via `VtexAdsService`; beacons por IntersectionObserver |
| `LastSeenProducts` | LastSeenProducts | `Eitri.sharedStorage` + `getProductById` |
| `BlogPostShelf` (alias `WordPressCardList`) | Blog/* | fetch WP inline; `SwiperContent`/`BlogCard` inlinados |
| `CategoryListVtex` | CategoryListVtex | `getCategoryTree`; **self-contained** (header de voltar interno, sem `setPageTitle`) |
| `ProductInfiniteScroll` | ProductInfiniteScroll | PLP com filtros/scroll; porta `ProductCatalogContent` + filtros |

> `ProductInfiniteScroll`, `CategoryListVtex`, `LastSeenProducts`, `VtexAdsBanner` e
> `BlogPostShelf` **não** aparecem nas páginas `pages-Home`/`pages-Categories` atuais — entram
> quando o CMS as referenciar.
