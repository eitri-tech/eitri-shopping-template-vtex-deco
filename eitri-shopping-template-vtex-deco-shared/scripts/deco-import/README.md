# deco-import

Importa o conteúdo do **VTEX Headless CMS** (projeto/builder `app-eitri`) para
`.deco/blocks`, **no formato que o runtime Deco deste repo consome**.

É a versão automatizada do seed manual dos `pages-Home.json` / `pages-Categories.json`:
em vez de escrever os blocks à mão, puxa o conteúdo real do CMS de produção.

Abordagem portada de [`agencia-e-plus/faststoretorra`](https://github.com/agencia-e-plus/faststoretorra)
(`scripts/deco/import-faststore-cms.ts`), adaptada ao contrato do Eitri (nome de arquivo
fixo + mapa manual de seções).

## Uso

```bash
# a partir da raiz do shared
npm run deco:import

# ou direto (de qualquer lugar do repo)
node eitri-shopping-template-vtex-deco-shared/scripts/deco-import/import-vtex-cms.mjs

# só reporta o que buscou, sem escrever nada
node …/import-vtex-cms.mjs --dry-run
```

Depois de importar, rode `npm run deco:generate` para regenerar o schema/meta do Deco.

## Configuração

Fonte padrão: `https://master--YOUR_VTEX_ACCOUNT.myvtex.com/_v/cms/api/app-eitri` — o mesmo
projeto/builder que o runtime (`home/src/services/CmsService.js`, via
`Vtex.cms.getPagesByContentTypes(projectId, …)`) usa. Sobrescreva por env:

| Variável | Default | Função |
|---|---|---|
| `VTEX_ACCOUNT` (ou `NEXT_PUBLIC_STORE_ID`) | `YOUR_VTEX_ACCOUNT` | conta VTEX |
| `VTEX_WORKSPACE` | `master` | workspace |
| `VTEX_CMS_PROJECT` | `app-eitri` | projeto/builder do Headless CMS |
| `VTEX_CMS_BASE_URL` | derivado dos acima | URL completa do CMS (tem prioridade) |

Para listar os content types e contagens de um projeto:
`GET https://master--YOUR_VTEX_ACCOUNT.myvtex.com/_v/cms/api/app-eitri` (campo `contentTypes`).
Hoje o projeto tem: `home` (1 doc), `categories` (1 doc), `landingPage` (0), `badges` (0).

## Como funciona — e por que não é o script genérico do Deco

Diferente de um site Deco `website` (routing por path, nomes de block livres), o app Eitri
carrega cada página por **nome de arquivo fixo**:

- `DecoCMSContentRender` (`shared/src/components/DecoCMSContentRender`) tem um
  `PAGE_LOADERS` que faz `import('../../../.deco/blocks/pages-<Nome>.json')` — então o
  arquivo **precisa** se chamar `pages-Home.json`, `pages-Categories.json`, etc.
- Cada seção é resolvida pelo `SECTION_MAP` manual em `shared/src/utils/resolveSection.ts`,
  chaveado pelo caminho sob `site/sections/` (ex.: `Banners/MultipleImageBanner`).

Por isso o importer:

1. Mapeia content type → página em `CONTENT_TYPE_TO_PAGE` (`home`→`Home`, `categories`→`Categories`)
   e grava `pages-<Nome>.json`, **sobrescrevendo o seed manual**.
2. Mapeia o nome da seção do CMS para o `__resolveType` que o `resolveSection` espera.
   Seções em subpasta/alias ficam em `SECTION_PATH_OVERRIDES` (ex.:
   `MultipleImageBanner` → `site/sections/Banners/MultipleImageBanner.tsx`); o resto vira
   `site/sections/<nome>.tsx`.
3. Import atômico: escreve num staging (`.deco/.blocks-import`) e só então move para `.deco/blocks`.
4. **Valida cobertura**: lê as chaves registradas no `resolveSection.ts` e avisa quais seções
   do CMS **não** têm componente registrado (elas importam, mas renderizam "Seção não
   encontrada" no app). Use isso como checklist do que ainda falta migrar.
5. Converte valores Draft.js (rich text) para HTML **se** `draftjs-to-html` estiver instalado
   (valor cru guardado em `__cms.draftjs`); senão, deixa como JSON cru.

## Adicionar uma nova página

1. Registre o content type em `CONTENT_TYPE_TO_PAGE` neste script.
2. Adicione o loader correspondente no `PAGE_LOADERS` do `DecoCMSContentRender`
   (o `import()` precisa de caminho string literal — uma entrada por página).

## Adicionar uma nova seção

Se o import avisar que uma seção não está registrada, crie o componente em
`shared/src/sections/<Nome>.tsx` e registre-o no `SECTION_MAP` do `resolveSection.ts`
(e, se ficar em subpasta, adicione o override em `SECTION_PATH_OVERRIDES` aqui).
