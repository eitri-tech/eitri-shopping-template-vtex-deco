#!/usr/bin/env node
/**
 * section-sync — acompanha as mudanças que o outro time faz nos componentes de CMS
 * do `home` que foram migrados para `shared/src/sections` (versão `.tsx` tipada).
 *
 * Como a migração muda a estrutura (props.data -> props achatadas, .jsx -> .tsx,
 * imports repontados), não dá para copiar automaticamente. Este utilitário mostra
 * o QUE mudou upstream desde o último sync para você reaplicar na versão tipada.
 *
 * Uso (a partir de qualquer lugar do repo):
 *   node scripts/section-sync/sync.mjs status                       # baseline -> working tree
 *   node scripts/section-sync/sync.mjs status --against origin/main # baseline -> um ref (branch/tag/sha)
 *   node scripts/section-sync/sync.mjs diff <key> -a origin/feat/x  # diff das origens contra um ref
 *   node scripts/section-sync/sync.mjs log  <key> -a origin/feat/x  # commits upstream nas origens
 *   node scripts/section-sync/sync.mjs bump <key|all>               # marca como sincronizado (baseline = HEAD)
 *   node scripts/section-sync/sync.mjs scan --against origin/feat/x # só lista quais sections mudaram
 *   node scripts/section-sync/sync.mjs list
 *   node scripts/section-sync/sync.mjs apply <key|all> [-a ref]     # reaplica o diff upstream na .tsx via `claude -p`
 *
 * `apply` automatiza o passo manual: para cada section com mudança upstream ele monta
 * o contexto (diff das origens + regras da migração + arquivo alvo) e delega a
 * reaplicação ao Claude Code em modo headless, valida a sintaxe com esbuild e só então
 * dá `bump` no baseline. Flags: `--dry-run` (só imprime o prompt), `--no-bump`,
 * `--model <m>`.
 *
 * `--against <ref>` (ou `-a <ref>`) compara o baseline contra QUALQUER ref git
 * (ex.: origin/main, origin/feat/product-shelf-improvements). Sem ele, compara
 * o baseline contra a sua working tree atual.
 */

import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const MANIFEST_PATH = join(__dirname, 'manifest.json')

function git(args, opts = {}) {
	const res = spawnSync('git', args, { encoding: 'utf8', ...opts })
	if (res.error) throw res.error
	return res
}

const repoRoot = git(['rev-parse', '--show-toplevel']).stdout.trim()
const HEAD = git(['rev-parse', 'HEAD']).stdout.trim()

const loadManifest = () => JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'))
const saveManifest = m => writeFileSync(MANIFEST_PATH, JSON.stringify(m, null, 2) + '\n')

const c = {
	reset: '\x1b[0m',
	bold: '\x1b[1m',
	dim: '\x1b[2m',
	green: '\x1b[32m',
	yellow: '\x1b[33m',
	red: '\x1b[31m',
	cyan: '\x1b[36m'
}

// baseline -> ref (se ref) | baseline -> working tree (se !ref)
const range = (entry, ref) => (ref ? [entry.baseline, ref] : [entry.baseline])

function hasChanges(entry, ref) {
	const res = git(['diff', '--quiet', ...range(entry, ref), '--', ...entry.sources], { cwd: repoRoot })
	return res.status === 1 // 0 = igual, 1 = diff, outro = erro
}

const statStr = (entry, ref) =>
	git(['diff', '--stat', ...range(entry, ref), '--', ...entry.sources], { cwd: repoRoot }).stdout.trim()

const commitsSince = (entry, ref) =>
	git(['log', '--oneline', '--no-decorate', `${entry.baseline}..${ref || HEAD}`, '--', ...entry.sources], {
		cwd: repoRoot
	}).stdout.trim()

function findEntry(manifest, key) {
	const entry = manifest.entries.find(e => e.key === key)
	if (!entry) {
		console.error(`${c.red}Section "${key}" não encontrada no manifest.${c.reset}`)
		console.error(`Disponíveis: ${manifest.entries.map(e => e.key).join(', ')}`)
		process.exit(1)
	}
	return entry
}

function assertRef(ref) {
	if (!ref) return
	const res = git(['rev-parse', '--verify', '--quiet', `${ref}^{commit}`], { cwd: repoRoot })
	if (res.status !== 0) {
		console.error(`${c.red}Ref git inválido: "${ref}".${c.reset} Fez git fetch? (ex.: git fetch origin)`)
		process.exit(1)
	}
}

const against = ref => (ref ? `ref ${c.cyan}${ref}${c.reset}` : 'working tree')

function cmdStatus(manifest, ref, { quiet = false } = {}) {
	console.log(`${c.bold}section-sync — mudanças upstream: baseline → ${against(ref)}${c.reset}`)
	console.log(`${c.dim}repo: ${repoRoot}${c.reset}\n`)
	let changedCount = 0
	for (const entry of manifest.entries) {
		if (!hasChanges(entry, ref)) {
			if (!quiet) console.log(`${c.green}✓ ${entry.key}${c.reset} — em dia`)
			continue
		}
		changedCount++
		console.log(`${c.yellow}● ${c.bold}${entry.key}${c.reset}${c.yellow} — MUDOU${c.reset}`)
		console.log(`${c.dim}  ${entry.baseline.slice(0, 8)} → ${ref || 'working tree'}${c.reset}`)
		const stat = statStr(entry, ref)
		if (stat) console.log(stat.split('\n').map(l => '    ' + l).join('\n'))
		const cmd = `node scripts/section-sync/sync.mjs diff ${entry.key}${ref ? ` -a ${ref}` : ''}`
		console.log(`${c.dim}  → ${cmd}${c.reset}\n`)
	}
	console.log(`\n${c.bold}${changedCount}${c.reset} section(s) com mudanças de ${manifest.entries.length}.`)
}

function cmdDiff(manifest, key, ref) {
	const entry = findEntry(manifest, key)
	const out = git(['diff', ...range(entry, ref), '--', ...entry.sources], { cwd: repoRoot }).stdout
	if (!out.trim()) {
		console.log(`${c.green}Sem mudanças em "${key}" (baseline → ${ref || 'working tree'}).${c.reset}`)
		return
	}
	process.stdout.write(out)
}

function cmdLog(manifest, key, ref) {
	const entry = findEntry(manifest, key)
	const out = commitsSince(entry, ref)
	console.log(out || `${c.green}Nenhum commit em ${entry.baseline.slice(0, 8)}..${ref || HEAD}.${c.reset}`)
}

// baseline novo = commit do ref usado na comparação (ou HEAD, se comparou com a working tree)
const resolveBaseline = ref => (ref ? git(['rev-parse', `${ref}^{commit}`], { cwd: repoRoot }).stdout.trim() : HEAD)

function cmdBump(manifest, key, ref) {
	const target = resolveBaseline(ref)
	if (key === 'all') {
		manifest.entries.forEach(e => (e.baseline = target))
		saveManifest(manifest)
		console.log(`${c.green}Baseline de TODAS as sections → ${target.slice(0, 8)}.${c.reset}`)
		return
	}
	const entry = findEntry(manifest, key)
	const prev = entry.baseline
	entry.baseline = target
	saveManifest(manifest)
	console.log(`${c.green}"${key}": baseline ${prev.slice(0, 8)} → ${target.slice(0, 8)}.${c.reset}`)
}

// ---- apply: reaplica o diff upstream na versão tipada via `claude -p` ----

const diffStr = (entry, ref) => git(['diff', ...range(entry, ref), '--', ...entry.sources], { cwd: repoRoot }).stdout

function buildPrompt(entry, ref, diff) {
	const alvo = targetIsFile(entry)
		? `- alvo    : ${entry.target}`
		: `- alvo    : ${entry.target}\n            (descrição, não um caminho — localize os arquivos correspondentes no shared)`
	const validacao = targetIsFile(entry)
		? `4. Valide a sintaxe: \`npx --no-install esbuild ${entry.target} --jsx=automatic\`.`
		: `4. Valide a sintaxe de cada arquivo que editar: \`npx --no-install esbuild <arquivo> --jsx=automatic\`.`
	return `Você está sincronizando uma section do CMS neste monorepo Eitri (leia o AGENTS.md da raiz).

O time paralelo alterou os componentes legados do app \`home\` que deram origem à section
tipada do \`shared\`. Sua tarefa é **reaplicar essas mudanças** no arquivo alvo tipado,
preservando a estrutura da migração.

- section : ${entry.key}
${alvo}
- origens : ${entry.sources.join(', ')}
- range   : ${entry.baseline.slice(0, 8)} → ${ref || 'working tree'}

Regras da migração (NÃO desfaça nenhuma delas):
- O alvo é \`.tsx\` **tipado**: mantenha \`export interface Props\` + \`export default\`, os JSDoc
  (\`@title\`, \`@description\`, \`@format\`) e as sub-interfaces exportadas.
- Props são **achatadas** no alvo (\`function Foo({ title, tabs = [] }: Props)\`), enquanto a
  origem usa \`props.data\` aninhado. Traduza, não copie.
- Imports são repontados para o shared (services/utils/hooks/types em \`.ts\`, componentes em
  \`.tsx\`); imports devem ser **explícitos** (o auto-import do Eitri pode colidir).
- Só componentes \`eitri-luminus\` (sem tags HTML cruas), Tailwind + DaisyUI via \`className\`,
  sem prop \`style\` e sem utilitários \`hover:\`/\`focus:\`/\`active:\`.
- Deps de cart/snackbar vêm dos hooks proxy de \`shared/src/providers/CmsDependencies\`.

Passos:
1. Leia o arquivo alvo e os arquivos de origem relevantes.
2. Aplique no alvo **apenas** o que mudou no diff abaixo (layout/lógica/props novas),
   adaptando à forma tipada. Se uma mudança upstream não fizer sentido no alvo (ex.: mexe
   só em \`props.data\` ou em infra do home), ignore-a.
3. Se a mudança introduzir uma prop nova de CMS, adicione-a à \`Props\` com JSDoc.
${validacao}

Observação: o alvo pode não ser o único arquivo a mudar — a section também depende de
componentes/utils portados para o shared (ex.: ProductCard, ShelfOfProducts, MetalSwatches).
Edite o que a mudança exigir dentro do shared. E confira antes se a mudança **já não foi
reaplicada** por um sync anterior; nesse caso não duplique nada.

Ao final, responda em no máximo 5 linhas: o que foi reaplicado e o que foi deliberadamente
ignorado. Não faça commit.

A ÚLTIMA linha da sua resposta deve ser exatamente um destes marcadores, sozinho:
- \`SYNC_RESULT: applied\`         — você editou o shared para incorporar a mudança upstream
- \`SYNC_RESULT: already-applied\` — nada a fazer: o shared já refletia o diff (ou o diff não
  afeta a versão tipada)
- \`SYNC_RESULT: manual\`          — não foi possível reaplicar com segurança; precisa de humano

--- DIFF UPSTREAM DAS ORIGENS ---
${diff}`
}

function runClaude(prompt, model) {
	const args = [
		'-p',
		'--permission-mode',
		'acceptEdits',
		'--allowedTools',
		'Read,Edit,Write,Grep,Glob,Bash(npx --no-install esbuild:*)'
	]
	if (model) args.push('--model', model)
	const res = spawnSync('claude', args, {
		cwd: repoRoot,
		input: prompt,
		encoding: 'utf8',
		stdio: ['pipe', 'pipe', 'inherit'],
		maxBuffer: 64 * 1024 * 1024
	})
	if (res.error?.code === 'ENOENT') {
		console.error(`${c.red}CLI "claude" não encontrada no PATH — use --dry-run e cole o prompt manualmente.${c.reset}`)
		process.exit(1)
	}
	const out = (res.stdout || '').trim()
	if (out) console.log(out.split('\n').map(l => '  ' + l).join('\n'))
	const marker = out.match(/SYNC_RESULT:\s*(applied|already-applied|manual)/gi)?.pop()
	return {
		ok: res.status === 0,
		verdict: marker ? marker.split(':')[1].trim().toLowerCase() : null
	}
}

// alguns targets do manifest são descritivos (ex.: a entry "infra" lista vários arquivos),
// não um caminho — só dá para tratar como arquivo o que existe em disco
const targetIsFile = entry => existsSync(join(repoRoot, entry.target))

const sharedDir = entry => `${entry.target.split('/')[0]}/src`

// "houve edição no shared?" — o alvo não é o único arquivo que a section pode tocar
function sharedFingerprint(entry) {
	const dir = sharedDir(entry)
	const status = git(['status', '--porcelain', '--', dir], { cwd: repoRoot }).stdout
	const diff = git(['diff', '--', dir], { cwd: repoRoot }).stdout
	return status + ' ' + diff
}

// arquivos .ts/.tsx do shared modificados/novos na working tree — é o que o agente mexeu
function dirtySharedFiles(entry) {
	const out = git(['status', '--porcelain', '--', sharedDir(entry)], { cwd: repoRoot }).stdout
	return out
		.split('\n')
		.map(l => l.slice(3).trim().replace(/^.* -> /, '')) // renames: fica com o destino
		.filter(p => /\.tsx?$/.test(p))
}

// um arquivo por vez, sem --outdir: o esbuild escreve o bundle em stdout (descartado),
// então a checagem nunca toca o disco
function syntaxOk(files) {
	let ok = true
	for (const file of [...new Set(files)].filter(f => existsSync(join(repoRoot, f)))) {
		const res = spawnSync('npx', ['--no-install', 'esbuild', file, '--jsx=automatic'], {
			cwd: repoRoot,
			encoding: 'utf8'
		})
		if (res.error || res.status === null) return true // esbuild indisponível: não bloqueia
		if (res.status !== 0) {
			console.error(`${c.red}  ✘ ${file}${c.reset}`)
			console.error(res.stderr?.trim())
			ok = false
		}
	}
	return ok
}

function applyEntry(manifest, entry, ref, opts) {
	console.log(`\n${c.bold}▶ ${entry.key}${c.reset} ${c.dim}(${entry.target})${c.reset}`)
	if (!hasChanges(entry, ref)) {
		console.log(`${c.green}  em dia — nada a aplicar.${c.reset}`)
		return true
	}
	const prompt = buildPrompt(entry, ref, diffStr(entry, ref))
	if (opts.dryRun) {
		console.log(`${c.dim}--- prompt (dry-run) ---${c.reset}`)
		process.stdout.write(prompt + '\n')
		return true
	}
	const before = sharedFingerprint(entry)
	const { ok, verdict } = runClaude(prompt, opts.model)
	if (!ok) {
		console.error(`${c.red}  claude falhou em "${entry.key}" — baseline mantido.${c.reset}`)
		return false
	}
	const edited = sharedFingerprint(entry) !== before

	if (verdict === 'manual') {
		console.log(`${c.yellow}  precisa de revisão humana — baseline mantido.${c.reset}`)
		return false
	}
	if (verdict === 'already-applied' && !edited) {
		console.log(`${c.green}  já estava reaplicado no shared — nada a editar.${c.reset}`)
	} else if (!edited) {
		// sem marcador e sem edição: não dá para afirmar que sincronizou
		console.log(`${c.yellow}  nenhum arquivo do shared foi modificado e o agente não confirmou`)
		console.log(`  que já estava em dia — revise manualmente; baseline mantido.${c.reset}`)
		return false
	}
	if (edited && !syntaxOk(dirtySharedFiles(entry))) {
		console.error(`${c.red}  erro de sintaxe nos arquivos editados — baseline mantido.${c.reset}`)
		return false
	}
	if (opts.noBump) {
		console.log(`${c.yellow}  aplicado (--no-bump: baseline mantido).${c.reset}`)
		return true
	}
	cmdBump(manifest, entry.key, ref)
	return true
}

function cmdApply(manifest, key, ref, opts) {
	const entries = key === 'all' ? manifest.entries : [findEntry(manifest, key)]
	console.log(`${c.bold}section-sync apply — baseline → ${against(ref)}${c.reset}`)
	if (!opts.dryRun) console.log(`${c.dim}revise o diff do shared antes de commitar (git diff).${c.reset}`)
	const failed = []
	for (const entry of entries) if (!applyEntry(manifest, entry, ref, opts)) failed.push(entry.key)
	if (failed.length) {
		console.error(`\n${c.red}Precisam de atenção manual: ${failed.join(', ')}${c.reset}`)
		process.exit(1)
	}
	console.log(`\n${c.green}apply concluído.${c.reset}`)
}

function cmdList(manifest) {
	for (const e of manifest.entries) {
		console.log(`${c.cyan}${e.key}${c.reset}  ${c.dim}(baseline ${e.baseline.slice(0, 8)})${c.reset}`)
		console.log(`  target : ${e.target}`)
		console.log(`  sources: ${e.sources.join('\n           ')}`)
	}
}

// ---- parse args (extrai --against/-a) ----
const raw = process.argv.slice(2)
let ref = null
let model = null
let dryRun = false
let noBump = false
const args = []
for (let i = 0; i < raw.length; i++) {
	if (raw[i] === '--against' || raw[i] === '-a') ref = raw[++i]
	else if (raw[i].startsWith('--against=')) ref = raw[i].slice('--against='.length)
	else if (raw[i] === '--model' || raw[i] === '-m') model = raw[++i]
	else if (raw[i].startsWith('--model=')) model = raw[i].slice('--model='.length)
	else if (raw[i] === '--dry-run') dryRun = true
	else if (raw[i] === '--no-bump') noBump = true
	else args.push(raw[i])
}
const [cmd = 'status', arg] = args
const manifest = loadManifest()
assertRef(ref)

switch (cmd) {
	case 'status':
		cmdStatus(manifest, ref)
		break
	case 'scan':
		cmdStatus(manifest, ref, { quiet: true })
		break
	case 'diff':
		if (!arg) console.error('uso: sync.mjs diff <key> [--against <ref>]')
		else cmdDiff(manifest, arg, ref)
		break
	case 'log':
		if (!arg) console.error('uso: sync.mjs log <key> [--against <ref>]')
		else cmdLog(manifest, arg, ref)
		break
	case 'bump':
		if (!arg) console.error('uso: sync.mjs bump <key|all> [--against <ref>]')
		else cmdBump(manifest, arg, ref)
		break
	case 'apply':
		if (!arg) console.error('uso: sync.mjs apply <key|all> [--against <ref>] [--dry-run] [--no-bump] [--model <m>]')
		else cmdApply(manifest, arg, ref, { dryRun, noBump, model })
		break
	case 'list':
		cmdList(manifest)
		break
	default:
		console.error(
			`comando desconhecido: ${cmd}\nuse: status | scan | diff <key> | log <key> | apply <key|all> | bump <key|all> | list  [--against <ref>]`
		)
		process.exit(1)
}
