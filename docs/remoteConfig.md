# Remote App Configs — Documentação

Arquivo base para documentar e padronizar as opções disponíveis no Remote Config, considerando múltiplos providers (ex: VTEX, WAKE) e features desacopladas do código.

---

## 🧩 Estrutura Geral

```json
{
  "ecommerceProvider": "VTEX" | "WAKE",
  "providerInfo": {},
  "searchOptions": {},
  "appConfigs": {
    "home": {},
    "cart": {},
    "checkout": {},
    "productCard": {},
    "pdp": {},
    "productCatalog": {},
    "externalPayments": []
  },
  "eitriConfig": {},
  "storePreferences": {},
  "sizeBay": {}
}
```

---

## 🏪 ecommerceProvider

Define o provedor de e-commerce utilizado no app.

| Campo             | Tipo                 | Descrição            |
| ----------------- | -------------------- | -------------------- |
| ecommerceProvider | `"VTEX"` \| `"WAKE"` | Plataforma utilizada |

---

## 🔌 providerInfo

Configurações específicas do provider.

| Campo              | Tipo         | Descrição                                                                                               |
| ------------------ | ------------ | ------------------------------------------------------------------------------------------------------- |
| account            | string       | Conta VTEX                                                                                              |
| faststore          | string       | Projeto Faststore                                                                                       |
| host               | string (URL) | Endpoint IO                                                                                             |
| domain             | string (URL) | Domínio principal                                                                                       |
| vtexCmsUrl         | string       | URL do CMS VTEX                                                                                         |
| wakeCmsUrl         | string       | URL CMS Wake                                                                                            |
| eitriContentCmsUrl | string       | CMS intermediário                                                                                       |
| eitriCmsHomeKey    | string       | Chave da home no CMS Wake                                                                               |
| cartHost           | string       | Endpoint de carrinho                                                                                    |
| apiHost            | string       | Endpoint base                                                                                           |
| tcs_account        | string       | ID TCS                                                                                                  |
| sizebayStoreId     | number       | ID da loja no Sizebay                                                                                   |
| konfidencyCustomer | string       | Cliente Konfidency                                                                                      |
| useVtexCms         | boolean      | Se `true`, busca páginas CMS diretamente na API da VTEX; se `false`, busca no endpoint interno da Eitri |

---

## 🔎 searchOptions

| Campo        | Tipo    | Descrição          |
| ------------ | ------- | ------------------ |
| legacySearch | boolean | Ativa busca legada |

---

## ⚙️ appConfigs

Configurações visuais e comportamentais do app.

### Gerais

| Campo                       | Tipo                      | Descrição                                              |
| --------------------------- | ------------------------- | ------------------------------------------------------ |
| clarityId                   | string                    | ID Microsoft Clarity                                   |
| disableWishlist             | boolean                   | Desabilitar wishlist                                   |
| statusBarTextColor          | `"white"` \| `"black"`    | Cor da status bar                                      |
| headerLogo                  | string (URL)              | Logo do header                                         |
| headerBackgroundColor       | string                    | Cor do header                                          |
| headerContentColor          | string                    | Cor do conteúdo do header                              |
| headerComponent             | string                    | Centralizar ou não a logo com a busca em baixo         |
| productCardImageAspectRatio | string                    | Proporção das imagens dos cards, no formato `largura:altura` (ex.: `"1:1"` ou `"3:4"`; padrão: `"3:4"`) |
| useScrollEffect             | boolean                   | Efeito de scroll no header                             |
| showSearchBar               | boolean                   | Exibe barra de busca                                   |
| productShelfMode            | `"scroll"` \| `"grid"`    | Modo da vitrine                                        |
| salesChannel                | number                    | Canal de venda                                         |
| autoTriggerGAEvents         | boolean (default: `true`) | Envia eventos automáticos de carrinho e checkout ao GA |
| sendGACampaignAlongSession  | boolean (default: `true`) | Envia segmentos ao GA na criação da sessão             |

---

### 🏠 home

```json
"home": {
  "categoryGallery": {
    "centerTitleAndTabs": false
  },
  "hiddenCategorySortOptions": [
    "price:desc",
    "name:asc",
    "name:desc"
  ]
}
```

| Campo                              | Tipo                       | Descrição                                                                                                                        |
| ---------------------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| categoryGallery.centerTitleAndTabs | boolean (default: `false`) | Quando `true`, centraliza o título e as abas do `CategoryGallery`. Por padrão, ambos mantêm o alinhamento original.               |
| hiddenCategorySortOptions          | string[]                   | Ordenações ocultadas na página de categorias e na busca. Aceita os valores da busca (`price:desc`, `name:asc`, `name:desc`) ou seus IDs VTEX (`OrderByPriceDESC`, `OrderByNameASC`, `OrderByNameDESC`). Quando ausente, inválido ou vazio, todas as opções são exibidas. |

---

### 🧺 cart

```json
"cart": {
  "sellerCode": {
    "enabled": true,
    "masterDataEntity": "VC",
    "searchField": "cdv",
    "responseFields": "cdv,vendedor,sexo,linx,ativo",
    "campaignIdentifier": "campanha-vendedor",
    "partIdentifierTemplate": "VENDEDOR: Codigo:{code} Nome: {name}",
    "textFieldToCartTemplate": "VENDEDOR {code}"
  },
  "iconType": "cart",
  "hideKeepBuyingButton": false
}
```

**sellerCode** — Permite vincular um vendedor ao carrinho e buscar dados adicionais via Master Data.

| Campo            | Tipo    | Descrição                       |
| ---------------- | ------- | ------------------------------- |
| enabled          | boolean | Ativa uso de código de vendedor |
| masterDataEntity | string  | Entidade do Master Data         |
| searchField      | string  | Campo usado na busca            |
| responseFields   | string  | Campos retornados (CSV)         |
| campaignIdentifier | string | Campanha de marketing a ser utilizada |
| partIdentifierTemplate | string | Template do part identifier a ser utilizado |
| textFieldToCartTemplate | string | Template do texto a ser adicionado ao carrinho como observação |

**iconType** — Diferência se conteúdo terá textos com referencia a 'Carrinho' ou 'Sacola'
| iconType | `"cart"` \| `"bag"` | Identifica se carrinho do app será mesmo carrinho ou sacola ('bag' é o padrão) |

**hideKeepBuyingButton** — Oculta o botão "CONTINUAR COMPRANDO" no carrinho. Por padrão o botão é exibido (quando o carrinho não foi aberto via bottomBar) e dispara `Eitri.navigation.back()`. Defina como `true` para desativá-lo em clientes específicos.

| Campo                | Tipo                       | Descrição                                                                |
| -------------------- | -------------------------- | ------------------------------------------------------------------------ |
| hideKeepBuyingButton | boolean (default: `false`) | Quando `true`, oculta o botão de continuar comprando na Home do carrinho |

---

### 💳 checkout

```json
"checkout": {
  "requestLogin": true,
  "recaptchaKey": "...",
  "paymentSystemDisplayOrder": ["creditCardPaymentGroup", "bankInvoicePaymentGroup"],
  "specialGiftCardLabel": "Vale presente",
  "hiddenPaymentsMethods": ["giftCardPaymentGroup"],
  "showAllDeliveryOptions": false
}
```

| Campo                     | Tipo                                | Descrição                                                                                                                                        |
| ------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| requestLogin              | boolean (default: `false`)          | Quando `true`, exige login antes de iniciar o checkout; se o login falhar ou for recusado, navega de volta à tela anterior                       |
| recaptchaKey              | string                              | Chave pública do reCAPTCHA v3                                                                                                                    |
| paymentSystemDisplayOrder | string[]                            | Ordem de exibição dos grupos de pagamento; grupos não listados aparecem ao final                                                                 |
| specialGiftCardLabel      | string (default: `"Vale presente"`) | Label do grupo de vale-presente especial                                                                                                         |
| hiddenPaymentsMethods     | string[]                            | Grupos de pagamento que não devem ser exibidos no checkout                                                                                       |
| showAllDeliveryOptions    | boolean (default: `false`)          | Exibe todas as opções de entrega disponíveis na tela de seleção de frete; quando `false`, mantém o fluxo atual com entrega mais rápida/econômica |

---

### 🛍️ productCard

```json
"productCard": {
  "style": "fullImage",
  "showListPrice": true,
  "buyGoesToPDP": true,
  "productVideoTag": "Videos",
  "showDiscountBadge": false,
  "discountTag": {
    "template": "<span style='position:absolute;top:7px;left:7px;z-index:99;font-size:10px;font-weight:300;color:#6b7280;line-height:1;text-align:center'>{percent}%<br/>OFF</span>"
  }
}
```

| Campo             | Tipo                                                            | Descrição                                        |
| ----------------- | --------------------------------------------------------------- | ------------------------------------------------ |
| style             | `"default"` \| `"fullImage"` \| `"editorial"` \| `"convenience"` | Layout do card (ver variantes abaixo)            |
| showListPrice     | boolean                                                         | Exibe preço de lista                             |
| buyGoesToPDP      | boolean                                         | Clique no botão de compra leva para a PDP        |
| productVideoTag   | string                                          | Tag utilizada para identificar vídeos do produto |
| showDiscountBadge | boolean (default: `false`)                      | Exibe badge de desconto no card e na PDP         |
| discountTag       | object                                          | Quando presente, exibe tag de desconto sobre a imagem do card. Quando ausente, nada é exibido |

#### 🎨 style — variantes de layout

Define o layout do card de produto. A mesma configuração é aplicada em todos os módulos que renderizam cards (home, pdp e account). Quando ausente ou com valor desconhecido, usa `default`.

| Valor         | Descrição                                                                                                                                                                                                       |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `default`     | Layout padrão vertical: imagem, título, preço, parcelas e botão de compra.                                                                                                                                       |
| `fullImage`   | Imagem em destaque ocupando o card, com wishlist e ações sobrepostas à imagem.                                                                                                                                   |
| `editorial`   | Layout editorial: imagem no topo (respeita `productCardImageAspectRatio`), título centralizado em **caixa alta**, preço centralizado e botão de sacola flutuante centralizado na base da imagem. Wishlist no canto superior direito e badge/`discountTag` no canto superior esquerdo. |
| `convenience` | Reservado — ainda não implementado.                                                                                                                                                                              |

Todas as variantes respeitam os demais campos de `productCard` (`showListPrice`, `showDiscountBadge`, `discountTag`), além de badges e wishlist.

#### 🏷️ discountTag

Exibe uma tag de desconto percentual sobre a imagem do card. Renderizada via `HTMLRender`, permitindo posicionamento e estilo totalmente livres via HTML inline. O cálculo é feito automaticamente a partir de `commertialOffer.ListPrice` e `commertialOffer.Price` da VTEX — a tag só aparece quando há desconto real (Price < ListPrice).

```json
"discountTag": {
  "template": "<span style='position:absolute;top:7px;left:7px;z-index:99;font-size:10px;font-weight:300;color:#6b7280;line-height:1;text-align:center'>{percent}%<br/>OFF</span>"
}
```

| Campo    | Tipo   | Descrição                                                                                                     |
| -------- | ------ | ------------------------------------------------------------------------------------------------------------- |
| template | string | HTML arbitrário renderizado sobre o card. Use `{percent}` como placeholder — será substituído pelo valor inteiro do desconto (ex: `50`) |

**Notas:**
- O posicionamento (`position:absolute`, `top`, `left`, `z-index`) deve ser definido via `style` inline no próprio template, pois o componente não adiciona wrapper de posicionamento.
- Para alinhar com o ícone de wishlist do layout `fullImage`: `top:7px; left:7px` (espelho do `top-[7px] right-[7px]` do coração). Para `default`: `top:5px; left:5px`.
- O desconto exibido é arredondado (`Math.round`). Um produto com 49,6% de desconto exibe `50%`.

---

### 📄 pdp

```json
"pdp": {
  "imageStyle": "fullwidth",
  "showDiscountBadge": false,
  "hideProperties": false,
  "hiddenProperties": ["Cor", "Tamanho"],
  "hiddenVariations": [],
  "similarComponent": "nome-da-app-similar",
  "similarColorComponent": true,
  "relatedProductsTitle": "Quem viu, viu também",
  "serviceLinks": {
    "exchangeAndReturnsUrl": "https://www.example.com/trocas-devolucoes",
    "digitalConsultantUrl": "https://api.whatsapp.com/send/?phone=%2B55...",
    "paymentMethodsUrl": "https://www.example.com/formas-de-pagamento"
  },
  "sizeTable": {
    "enabled": true,
    "imageUrl": "https://...",
    "buttonLabel": "Guia de medidas"
  },
  "genericSizeTable": {
    "buttonLabel": "Tabela de Tamanhos",
    "type": "image",
    "imageUrl": "https://cdn.example.com/tabela-tamanhos.png"
  },
  "componentHighlighter": ["Sobre", "Composição"]
}
```

| Campo                 | Tipo                       | Descrição                                                                                            |
| --------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------- |
| imageStyle            | string                     | Estilo da imagem principal                                                                           |
| showDiscountBadge     | boolean (default: `false`) | Exibe badge de desconto na PDP                                                                       |
| hideProperties        | boolean                    | Se `true`, oculta toda a seção de especificações do produto                                          |
| hiddenProperties      | string[]                   | Nomes de propriedades a serem ocultadas individualmente da seção de especificações                   |
| hiddenVariations      | string[]                   | Nomes de variações a serem ocultadas                                                                 |
| hideUnavailableVariations | boolean (default: `false`) | Quando `true`, oculta individualmente os valores de variação com estoque zero ou indisponíveis; o modo padrão (`false`) mantém esses valores visíveis com estilo de riscado |
| noDefaultVariation    | boolean (default: `false`) | Quando `true`, nenhuma variação vem pré-selecionada ao abrir a PDP; o usuário deve escolher explicitamente |
| similarComponent      | string                     | Slug da app a ser carregada como componente de produtos similares; se ausente, o bloco não é exibido |
| similarColorComponent | boolean                    | Exibe seletor de cores similares                                                                     |
| relatedProductsTitle  | string                     | Título do bloco de produtos relacionados (RelatedProducts). Se ausente, usa o i18n `productBasicTemplate.txtWhoSaw` |
| serviceLinks          | object                     | URLs dos links de Troca e Devolução, Vendedor Digital e Formas de pagamento                          |

#### 🔗 serviceLinks

Somente as URLs são configuráveis. Textos, ícones, ordem e comportamento de abertura permanecem definidos no app. Quando uma chave estiver ausente ou vazia, o componente utiliza sua URL padrão.

| Campo                 | Tipo         | Descrição                       |
| --------------------- | ------------ | ------------------------------- |
| exchangeAndReturnsUrl | string (URL) | Link de Troca e Devolução       |
| digitalConsultantUrl  | string (URL) | Link do Vendedor Digital        |
| paymentMethodsUrl     | string (URL) | Link das Formas de pagamento    |

#### 📏 sizeTable (guia por imagem)

| Campo       | Tipo         | Descrição                   |
| ----------- | ------------ | --------------------------- |
| enabled     | boolean      | Ativa o guia de medidas     |
| imageUrl    | string (URL) | Imagem da tabela de medidas |
| buttonLabel | string       | Texto do botão              |

---

#### 🧩 genericSizeTable (guia genérico — imagem ou HTML)

Alternativa ao `sizeTable` que suporta dois formatos de conteúdo: imagem estática ou HTML arbitrário renderizado via WebView. Exibe um botão de ativação na PDP que abre um modal com o conteúdo configurado.

**Exemplo — tipo imagem:**

```json
"genericSizeTable": {
  "buttonLabel": "Tabela de Tamanhos",
  "type": "image",
  "imageUrl": "https://cdn.example.com/tabela-tamanhos.png"
}
```

**Exemplo — tipo HTML:**

```json
"genericSizeTable": {
  "buttonLabel": "Tabela de Tamanhos",
  "type": "html",
  "htmlContent": "<html><body><table>...</table></body></html>"
}
```

| Campo       | Tipo                    | Obrigatório           | Descrição                                                       |
| ----------- | ----------------------- | --------------------- | --------------------------------------------------------------- |
| buttonLabel | string                  | não                   | Texto do botão (padrão: `"Tabela de Tamanhos"`)                 |
| type        | `"image"` \| `"html"`   | sim                   | Define como o conteúdo é renderizado no modal                   |
| imageUrl    | string (URL)            | quando `type="image"` | URL da imagem da tabela de medidas                              |
| htmlContent | string (HTML completo)  | quando `type="html"`  | Conteúdo HTML renderizado via WebView com data URI              |

---

### 🗂️ productCatalog

```json
"productCatalog": {
  "useToolbar": false,
  "hiddenFilters": ["Marca"]
}
```

| Campo         | Tipo                       | Descrição                                                                                                                                                                                                                                                                                           |
| ------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| useToolbar    | boolean (default: `false`) | Quando `true`, usa o novo `ProductCatalogToolbar` no catálogo, incluindo chips de categorias quando a navegação possuir facets `category-*`. Quando ausente ou `false`, mantém o layout antigo com botões separados de filtro e ordenação.                                                          |
| hiddenFilters | string[]                   | Nomes de facetas a serem ocultadas no modal de filtros do catálogo. Comparação case-insensitive — `"Marca"` e `"marca"` produzem o mesmo efeito. Quando ausente ou vazio, todas as facetas retornadas pela API são exibidas (mantendo apenas as exclusões padrão de `PRICERANGE` e `hidden: true`). |

---

### 👤 account

```json
"account": {
  "helpLinks": {
    "whatsappUrl": "https://api.whatsapp.com/send/?phone=...",
    "faqUrl": "https://www.example.com/faq"
  },
  "bonusConsultation": {
    "url": "https://www.example.com/bonus-consultation",
    "label": "Consulte seu Bônus"
  }
}
```

**bonusConsultation** — Quando presente, exibe um botão na Home da conta que abre um link externo em in-app browser. Útil para integrações com serviços de bônus/cashback que possuem portal próprio. Quando ausente/`null`, o botão não é exibido.

| Campo                   | Tipo         | Descrição                                                                       |
| ----------------------- | ------------ | ------------------------------------------------------------------------------- |
| helpLinks               | object       | URLs da seção de ajuda da Account.                                               |
| helpLinks.whatsappUrl   | string (URL) | Abre externamente o atendimento pelo WhatsApp; usa o fallback quando ausente.    |
| helpLinks.faqUrl        | string (URL) | Abre as perguntas frequentes no navegador interno; usa o fallback quando ausente. |
| bonusConsultation       | object       | Quando presente, exibe o botão de consulta de bônus na Home da conta.            |
| bonusConsultation.url   | string (URL) | URL externa aberta em in-app browser ao clicar no botão.                         |
| bonusConsultation.label | string       | Texto exibido no botão (ex.: `"Consulte seu Bônus"`).                            |

---

### 🔗 externalPayments

```json
"externalPayments": [
  { "externalGroupName": "nomeDoGrupo" }
]
```

Lista de integrações de pagamento externas exibidas como grupos customizados no checkout.

| Campo             | Tipo   | Descrição                                                         |
| ----------------- | ------ | ----------------------------------------------------------------- |
| externalGroupName | string | Deve corresponder ao `groupName` retornado pela API de pagamentos |

---

## 📏 Size Guide

Duas abordagens suportadas:

### 1. 🧠 Sizebay (recomendado)

```json
"sizeBay": {
  "tenantId": "708",
  "buttonDiscoverSizeLabel": "Descubra seu tamanho",
  "buttonTableGuideLabel": "Tabela de Medidas"
}
```

| Campo                   | Tipo   | Descrição                 |
| ----------------------- | ------ | ------------------------- |
| tenantId                | string | ID do tenant no Sizebay   |
| buttonDiscoverSizeLabel | string | Texto do botão principal  |
| buttonTableGuideLabel   | string | Texto do botão secundário |

📌 Para recomendação automática de tamanho.

### 2. 🖼️ Fallback (imagem)

Usa `appConfigs.pdp.sizeTable`. Para lojas sem integração Sizebay.

### ⚠️ Regra de Prioridade

1. Se `sizeBay` estiver configurado → usar Sizebay
2. Senão, se `appConfigs.pdp.genericSizeTable` estiver configurado → usar tabela genérica (imagem ou HTML)
3. Senão, se `appConfigs.pdp.sizeTable.enabled = true` → usar tabela por imagem (legado)
4. Senão → não exibir guia de medidas

---

## 📱 eitriConfig

Configuração de navegação entre apps Eitri. Define tabs, rotas e permite deep navigation via `initParams`.

```json
"eitriConfig": {
  "mainApp": "eitri-shopping-demo-home",
  "bottomNavItems": [
    {
      "slug": "eitri-shopping-demo-home",
      "initParams": { "tabIndex": 0 }
    },
    {
      "slug": "eitri-shopping-demo-home",
      "initParams": {
        "tabIndex": 3,
        "route": "LandingPage",
        "landingPageName": "cupons"
      }
    },
    {
      "slug": "eitri-shopping-demo-home",
      "initParams": {
        "tabIndex": 1,
        "route": "Search",
        "searchTerm": "deals",
        "title": "Deals"
      }
    },
    {
      "slug": "eitri-shopping-demo-account",
      "initParams": { "tabIndex": 3 }
    }
  ]
}
```

---

## 🌎 storePreferences

Configurações de localização e moeda.

| Campo              | Tipo                   | Descrição                  |
| ------------------ | ---------------------- | -------------------------- |
| countryCode        | string                 | País                       |
| saveUserData       | boolean                | Salva dados do usuário     |
| currencyCode       | `"USD"` \| `"BRL"`     | Moeda                      |
| locale             | `"en-US"` \| `"pt-BR"` | Localização                |
| timeZone           | string                 | Fuso horário               |
| currencyLocale     | number                 | Locale numérico            |
| currencySymbol     | string                 | Símbolo da moeda           |
| currencyFormatInfo | object                 | Configuração de formatação |

**currencyFormatInfo:**

| Campo                    | Tipo    | Descrição                          |
| ------------------------ | ------- | ---------------------------------- |
| currencyDecimalDigits    | number  | Casas decimais                     |
| currencyDecimalSeparator | string  | Separador decimal                  |
| currencyGroupSeparator   | string  | Separador de milhar                |
| currencyGroupSize        | number  | Tamanho do grupo numérico          |
| startsWithCurrencySymbol | boolean | Símbolo posicionado antes do valor |
