# section-sync

Acompanha as mudanças que **outro time** faz nos componentes de CMS do `home` que
foram migrados para `shared/src/sections` (versão `.tsx` tipada, com props achatadas).

A migração é uma transformação estrutural (`.jsx`+`props.data` → `.tsx`+props achatadas +
tipos + imports repontados), então **não dá para copiar automaticamente** sem sobrescrever
o trabalho de tipagem. Em vez disso, este utilitário mostra **o que mudou upstream** desde o
seu último sync, para você reaplicar só a mudança de layout/lógica na versão tipada.

## Uso

Rode a partir de qualquer lugar do repositório (prefixo `node eitri-shopping-template-vtex-deco-shared/scripts/section-sync/sync.mjs`):

```bash
# o que mudou desde o último sync — baseline -> working tree (todos)
… sync.mjs status

# comparar contra um REF git qualquer (branch/tag/sha) em vez da working tree
… sync.mjs status --against origin/main
… sync.mjs status -a origin/feat/product-shelf-improvements

# só a lista das sections que mudaram (sem as "em dia")
… sync.mjs scan --against origin/main

# diff completo das origens de uma section (opcionalmente contra um ref)
… sync.mjs diff product-shelf
… sync.mjs diff product-shelf -a origin/feat/product-shelf-improvements

# commits upstream que tocaram nas origens (contra um ref)
… sync.mjs log product-shelf -a origin/main

# reaplica automaticamente o diff upstream na versão .tsx (via `claude -p`) e dá bump
… sync.mjs apply product-shelf -a origin/main
… sync.mjs apply all -a origin/main

# marca a section como sincronizada (baseline = HEAD, ou = ref se usar --against)
… sync.mjs bump product-shelf
… sync.mjs bump all

# lista sections e baselines
… sync.mjs list
```

### `--against <ref>` (ou `-a <ref>`)

Compara o baseline contra **qualquer ref git** — não só a working tree. Útil porque os
updates dos componentes costumam viver em **feature branches** antes de cair em `main`
(ex.: `origin/feat/product-shelf-improvements`, `origin/feat/newsletter`,
`origin/fix/product-card-novo-estilo`). Faça `git fetch origin` antes.

Sem `--against`, o comando compara o baseline com a sua working tree atual.

## `apply` — sincronização automatizada

Fecha o ciclo do `status`: para cada section com mudança upstream, monta o contexto
(diff das origens + regras da migração + arquivo alvo) e delega a reaplicação ao
**Claude Code em modo headless** (`claude -p`), valida a sintaxe com
`npx esbuild --jsx=automatic` e só então dá `bump` no baseline.

```bash
… sync.mjs apply category-gallery -a origin/main   # uma section
… sync.mjs apply all -a origin/main                # todas as que mudaram
… sync.mjs apply all --dry-run                     # só imprime o prompt (nada é editado)
… sync.mjs apply banner --no-bump                  # aplica mas mantém o baseline
… sync.mjs apply banner --model opus               # escolhe o modelo
```

O agente termina a resposta com um marcador (`SYNC_RESULT: applied | already-applied |
manual`) que decide o veredito:

| resultado | baseline |
|---|---|
| editou o shared + esbuild ok | **bump** |
| `already-applied` (o shared já refletia o diff, ou o diff não afeta a versão tipada) | **bump** |
| `manual`, `claude` falhou, erro de sintaxe, ou nada editado sem confirmação | **mantido**, key vai pra lista de atenção manual (exit 1) |

A detecção de "houve edição" cobre **todo o `shared/src`**, não só o `target` — uma section
costuma depender de componentes portados (`ProductCard`, `ShelfOfProducts`, `MetalSwatches`),
e mudanças neles contam como sincronização.

O `bump` usa o commit do `--against` (não o `HEAD`), então o baseline reflete exatamente o
que foi sincronizado.

Requer a CLI `claude` no PATH. Roda com `--permission-mode acceptEdits` e ferramentas
limitadas (`Read,Edit,Write,Grep,Glob` + `esbuild`), sem commitar — **revise o `git diff`
do shared antes de commitar**.

## Fluxo diário sugerido

1. `status` — veja quais sections tiveram mudança upstream.
2. Para cada uma que mudou: `diff <key>` — veja exatamente o que o outro time alterou.
3. Reaplique a mudança na versão `.tsx` correspondente (ver `target` no `list`) — manualmente
   ou com `apply <key>`.
4. `bump <key>` — carimba o baseline como sincronizado (o `apply` já faz isso).

O `status` compara `baseline → working tree`, então pega mudanças **commitadas e não
commitadas** nos arquivos de origem. O baseline fica salvo por section no `manifest.json`.

## Manutenção do manifest

Ao migrar uma nova section, adicione uma entrada em `manifest.json` com:
- `key`: identificador curto (kebab-case)
- `target`: caminho do arquivo `.tsx` no shared
- `sources`: arquivos/pastas de origem no `home` que alimentam essa section
- `baseline`: commit atual (`git rev-parse HEAD`) — ou rode `bump <key>` depois de criá-la

> Observação: como os apps consomem o **source local** do shared (ver `paths` no
> `tsconfig.json`), o baseline é um commit deste mesmo monorepo — o diff funciona direto,
> sem precisar de submódulos ou pacotes publicados.
