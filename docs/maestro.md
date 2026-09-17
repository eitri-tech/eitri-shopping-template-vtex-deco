# Testes E2E com Maestro

Testes de UI end-to-end rodando no app **Eitri Play** (`tech.eitri.play`) em um device Android real via adb.

## Pré-requisitos

- [Maestro CLI](https://docs.maestro.dev) e `adb` instalados (Java 17+). Validado com Maestro **2.5.1**.
- Device Android com o app **Eitri Play** instalado e pareado com este workspace:
  - Rode `eitri app start` na raiz e pareie o Eitri Play (QR code).
  - A lista "PUBLISHED EITRI-APPS" do launcher também sobe os apps sem `eitri app start`, mas roda a versão **publicada** — inútil para validar um diff local antes do PR. Os flows deste repo usam sempre o caminho de desenvolvimento.

## Conectando o device

USB: basta plugar e aceitar a depuração. Wi-Fi:

```sh
adb connect <ip-do-device>:<porta>
adb devices   # deve listar o device como "device"
```

## Rodando os flows

```sh
# um flow específico
maestro test .maestro/flows/smoke-home.yml

# todos os flows do workspace
maestro test .maestro/

# só a suíte de smoke
maestro test .maestro/ --include-tags smoke

# com mais de um device conectado
maestro --device <serial> test .maestro/flows/smoke-home.yml
```

### Os subflows não são alvo de execução

`.maestro/config.yaml` declara o glob `flows/*.yml`. Como `.maestro/subflows/` está fora dele, os subflows **não são coletados como teste** — eles rodam aninhados, dentro de cada flow que os chama via `runFlow: file:`. Não é preciso (nem possível) "rodar junto": apontar `maestro test` para `.maestro/subflows/` faria cada um rodar sozinho, fora de contexto, e falhar — `clear-cart.yml` e `add-one-item.yml` pressupõem um app já aberto na Home.

Para conferir que estão sendo executados, rode **um arquivo só**: a saída mostra os comandos do subflow indentados sob ele.

```
 > Flow smoke-home
Run ../subflows/bootstrap.yml...
  Launch app "tech.eitri.play"... COMPLETED
  Run flow when "Run Eitri-App" is visible...
    Tap on "Run Eitri-App"... COMPLETED
    Tap on point (50%,57%)... COMPLETED
    Erase 60 characters... COMPLETED
    Input text ${APP_SLUG}... COMPLETED
    Tap on "Run"... COMPLETED
Run ../subflows/bootstrap.yml... COMPLETED
Scrolling DOWN until "Categorias" is visible... COMPLETED
```

(`Input text ${APP_SLUG}` aparece sem expandir no log — é só como o Maestro imprime o template; o valor real é interpolado.)

### Detalhe da saída: arquivo único vs. diretório

Isso pega muita gente de surpresa — **o nível de detalhe muda conforme o alvo**:

| Comando | Saída |
| --- | --- |
| `maestro test <arquivo>.yml` | Completa: cada comando, com os subflows indentados (exemplo acima). |
| `maestro test .maestro/` | Agregada: só uma linha por flow, `[Passed] cart-checkout-flow (1m 54s)`. Os comandos não aparecem. |

Não é que os testes tenham sido omitidos — o renderer de diretório é que é resumido. Ao final ele imprime o placar (`9/9 Flows Passed in 10m 20s`).

Para ter detalhe rodando o conjunto inteiro:

```sh
# relatório navegável, comando a comando (inclui os passos dos subflows)
maestro test .maestro/ --format HTML-DETAILED --output relatorio.html

# relatório por flow, para CI
maestro test .maestro/ --format JUNIT --output resultado.xml

# logs e screenshots por flow (--flatten-debug-output evita subpastas com timestamp)
maestro test .maestro/ --debug-output /tmp/maestro-debug --flatten-debug-output

# saída verbosa no próprio terminal: rode arquivo a arquivo
for f in .maestro/flows/*.yml; do maestro test "$f" || break; done
```

Atenção: `--format` **não muda o console** — ele continua agregado. O detalhe vai para o arquivo passado em `--output`. Se o que você quer é ver comando a comando rolando no terminal, o caminho é o laço acima (ou um arquivo por vez).

## Ferramentas de inspeção

Três ferramentas, com papéis distintos:

| Ferramenta | Papel |
| --- | --- |
| **MCP do Maestro** (`maestro mcp`) | Runtime dos testes e fonte da verdade para seletores. `list_devices` → `inspect_screen` → `run`. Lê a árvore de acessibilidade, que é exatamente o que os seletores consultam. |
| **`maestro hierarchy`** | Mesma árvore, pela CLI, quando você quer processar os bounds com script. |
| **`android.py`** do plugin `eitri-coding` | Driver ADB com OCR (`screenshot`, `tap_text`, `tap_template`, `wait_text`, `scroll_to_text`). Serve para **explorar**, nunca dentro de um flow. Útil em dois casos: derivar a coordenada de alvos sem texto (`tap_template` acha o ícone por imagem) e cross-check OCR × árvore de acessibilidade. Caminho: `~/.claude/plugins/marketplaces/eitri-plugins/plugins/eitri-coding/skills/eitri-coding/tools/android.py` (requer `easyocr` + `opencv-python-headless`). |

Onde as duas visões divergirem, **o Maestro manda** — é ele que roda o teste. Registre a divergência num comentário do flow.

## Escrevendo novos flows

- Flows ficam em `.maestro/flows/*.yml` (registrados por `.maestro/config.yaml`, glob `flows/*.yml`).
- Trechos reutilizáveis ficam em `.maestro/subflows/` — **fora** do glob, portanto não são executados como teste. Consuma com `runFlow: { file: ../subflows/<x>.yml, env: {...} }`.
- Use `tags:` para agrupar: `maestro test .maestro/ --include-tags smoke`.
- Sempre inspecione a tela (`inspect_screen`) antes de escrever um seletor, e de novo depois de cada mudança de tela. **Nunca** escreva uma string a partir de um screenshot: o que parece um botão "Favoritos" na imagem pode não ter texto nenhum na árvore.

### O matcher de texto é regex de STRING INTEIRA

A pegadinha mais importante deste repositório. O `text:` do Maestro é regex com `IGNORE_CASE` que precisa casar a string **inteira** — casar um pedaço não funciona. Comprovado no device:

```
assertVisible: "Run Eitri"       -> FALHA
assertVisible: "Run Eitri-App"   -> passa
assertVisible: "Run Eitri.*"     -> passa
```

Consequências práticas:

- Não existe colisão por substring. `tapOn: "Adicionar"` **não** casa com "Adicionar à Sacola" — e vice-versa.
- Para texto dinâmico (nome de produto interpolado), use regex explícito: `"Deseja remover .* da sacola\\?"`.
- `"[0-9]{2}"` casa só com nós cujo texto inteiro são dois dígitos (os chips de tamanho), e não com `R$ 600,00` nem `7X de R$ 85,71 sem juros`.

### Gotchas do Eitri Play (launcher de dev)

- Ao abrir, o Eitri Play cai no **launcher de dev**. O subflow `bootstrap.yml` trata isso; todos os flows o consomem.
- **"Run Eitri-App" é um acordeão.** Colapsado, o campo de slug e o botão "Run" **não existem** na hierarquia. `launchApp` faz force-stop por padrão e devolve o launcher ao estado colapsado, então o `tapOn: "Run Eitri-App"` do bootstrap sempre expande, nunca fecha.
- **O EditText do slug só aparece na árvore quando tem texto.** Vazio — o caso normal no início de um flow — ele não é exposto, então não há seletor de texto nem relativo possível: o tap por posição (`point: "50%,57%"`, medido em 1080×2400) é obrigatório. Seletores relativos foram testados e falham: sem o nó na árvore, `below: "Run Eitri-App"` casa numa linha da lista de apps publicados e abre o app errado.
- **O valor do campo de slug persiste entre execuções.** Sem `eraseText` antes do `inputText`, o slug novo é concatenado ao antigo e o app não sobe.
- Rodando via "Run Eitri-App" o mini-app abre **sem a bottom bar nativa** — não asserte títulos de tab ("Inicio", "Sacola"); asserte conteúdo da tela (ex.: "Categorias" na home).
- O campo de slug tem **autocapitalização de sentença**: `inputText` com `?` no meio (ex.: `slug?route=Categories`) é corrompido pelo teclado (insere espaço e capitaliza a próxima letra) e o app nem abre. `pasteText` com string literal não é suportado nesta versão da CLI. Deeplinks não são exercitáveis por esse caminho — ver `deeplink-categories.yml`.

### Gotchas do conteúdo (WebView)

- O conteúdo do WebView **é** exposto na árvore de acessibilidade como nós `android.view.View` / `android.widget.TextView` com texto real. É isso que faz os seletores de texto funcionarem.
- Mas **placeholders de `<input>` não são expostos**. O nó existe e é `clickable`, porém com texto vazio — `tapOn: "Digite seu email"` falha com `Element not found` mesmo com o placeholder visível na tela. Vale para o campo de busca, o e-mail do login e o e-mail do checkout. Espere por um `Text` renderizado de verdade como sinal de carga (ex.: `histórico` na busca, `Email` no checkout) e toque no campo por posição.
- **O header da PDP não é fixo** — ele sai de vista quando a página rola. Depois de qualquer scroll na PDP, o tap no ícone da sacola em `(91%, 8%)` acerta a galeria de imagens. Ou não role, ou abra a sacola com um bootstrap novo usando o slug `eitri-shopping-template-vtex-deco-cart`.
- **"Sobre o produto" não serve como sinal de "PDP carregou"**: com a galeria de imagens em cache o acordeão nasce abaixo da dobra e a asserção falha de forma intermitente. Use `"Adicionar à Sacola"`, que é `fixed` no rodapé.
- **Chips de tamanho precisam de scroll antes do tap.** Sem rolar, eles ficam em ~91% da altura, colados na barra fixa "Adicionar à Sacola", e o tap não registra a seleção — o item vai para a sacola com o tamanho pré-selecionado. Use `scrollUntilVisible` com `centerElement: true`.
- **Swatches de Material/Pedras não são endereçáveis.** São `<Image>` 32×32 sem texto, sem `alt` e sem accessibility label (`MaterialSwatches.jsx:43-54`); os valores ("Prata", "Ouro Amarelo"…) só existem como chaves de lookup em `shared/utils/variationImages.js` e nunca chegam ao DOM. A seleção atual é sinalizada só por classe CSS (`border-primary`), também invisível na árvore. Dá para asserir os títulos `Material` / `Pedras`, não para tocar um swatch específico por texto.
- Ícones em geral (X de remover, +/- de quantidade, coração, logo, lupa) não têm texto — todos precisam de `point`. Coordenadas medidas neste device (1080×2400) estão comentadas nos flows.

### Estado que persiste entre execuções

O carrinho **persiste** (`clearState: false` não limpa o orderForm do VTEX, que é estado de servidor). Medido: chegou a 4 itens acumulados de rodadas anteriores. Em vez de aceitar os dois estados via regex, os flows agora **estabelecem a pré-condição**:

```yaml
- runFlow: { file: ../subflows/clear-cart.yml }
- runFlow: { file: ../subflows/add-one-item.yml }
- assertVisible: "1"   # badge do header
```

O `clear-cart.yml` chega à view de debug **Cartman** por easter egg (toques repetidos no logo do header — o contador de `home/src/utils/utils.js:13-21` começa em 10 e reseta para 7, então o número varia; o subflow usa `repeat` + `while notVisible` em vez de contagem fixa) e usa **`Limpar carrinho`**, que preserva o `orderFormId`. Atenção: `Cartman.jsx:39-42` não chama `setCart()`, então as linhas "Item na bolsa:" ficam desatualizadas na própria tela — não asserte sobre elas. A verificação real vem depois: o badge do header só renderiza com quantidade > 0 (`shared/HeaderCart.jsx:36`), então exigir exatamente `"1"` após adicionar um item prova que a sacola estava vazia antes.

## Subflows disponíveis

| Subflow | Faz |
| --- | --- |
| `bootstrap.yml` | Sobe um Eitri-App pelo dev launcher. Recebe `APP_SLUG` via `env`. |
| `clear-cart.yml` | Da Home, chega ao Cartman e esvazia a sacola. |
| `add-one-item.yml` | Da Home, busca "anel", abre a primeira PDP e adiciona 1 item. Termina na PDP **sem ter rolado**, deixando o header acessível. |

## Flows disponíveis (cobertura ESS-936)

| Flow | Tags | Cobre |
| --- | --- | --- |
| `smoke-home.yml` | `smoke` | Sobe o app e confirma que a home carrega |
| `navigation-search.yml` | `navigation`, `search` | Busca (ícone do header → termo → Enter) e chegada no PLP (Filtros/Ordenar) |
| `pdp-add-to-cart.yml` | `pdp`, `cart` | Sacola limpa → busca → PDP → "Adicionar à Sacola" → snackbar → badge = 1 → sacola com o item |
| `cart-remove-item.yml` | `cart`, `remove` | Sacola limpa → 1 item → X → modal "Excluir" → "Sua sacola está vazia" |
| `pdp-sku-variations.yml` | `pdp`, `sku` | Seleção de tamanho (`Aro do Anel`) com prova de propagação: o nome do item na sacola termina com o aro escolhido. Mais asserção de que as seções `Material`/`Pedras` renderizam |
| `cart-checkout-flow.yml` | `cart`, `checkout` | Sacola com item → "Finalizar Compra" → handoff pro checkout → dados pessoais (para no e-mail, não avança para pagamento) |
| `account-login.yml` | `account`, `login` | Conta deslogada → AuthSelect → SignIn (modo OTP) → envio de código com e-mail falso |
| `deeplink-categories.yml` | `deeplink` | **Gap confirmado**: o dev launcher não permite passar `route=...` via slug (autocapitalização corrompe o texto) |
| `push-permission.yml` | `push` | Prompt de permissão de notificação no boot da home (se ainda não resolvido no device) |

### Conta de teste no checkout

O `cart-checkout-flow.yml` usa `checkout-inexistente@example.com`, um e-mail claramente inexistente — de propósito, para não depender de uma conta real de produção. (Uma versão anterior usava `teste@teste.com`, que **é uma conta já cadastrada** nesta loja; foi trocado porque isso criava dependência de estado externo sem necessidade.) O flow não faz login com senha, não avança para pagamento e não finaliza pedido; o objetivo é validar que o checkout **reage** ao e-mail informado (segue para OTP, revela mais campos ou mostra erro de validação), não bater num caminho específico. A asserção final aceita todos os desfechos possíveis do `findUserByEmail` justamente porque ele depende do estado do backend.

**Fora do escopo destes flows** (decisão de produto): nenhum finaliza pedido de verdade nem usa senha real — validam estrutura e navegação, não transações completas. iOS não é coberto (sem tooling no momento). Push além do prompt de permissão (entrega/tap de notificação) é nativo e não é testável via este WebView. Tocar um swatch de material/pedra específico não é testável pelo motivo descrito acima.
