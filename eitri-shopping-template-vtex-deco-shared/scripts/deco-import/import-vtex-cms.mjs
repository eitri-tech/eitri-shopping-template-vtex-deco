/**
 * Re-runnable import from the VTEX Headless CMS (project/builder `app-eitri`) to
 * `.deco/blocks`, in the exact shape this repo's Deco runtime consumes.
 *
 * Unlike a generic Deco `website` site (path-based routing, arbitrary block
 * filenames), the Eitri app loads pages by **fixed filename** via `PAGE_LOADERS`
 * in `shared/src/components/DecoCMSContentRender` and resolves each section
 * through the manual `SECTION_MAP` in `shared/src/utils/resolveSection.ts`.
 * So this importer:
 *   - writes one `pages-<PageName>.json` per mapped content type (overwriting the
 *     hand-seeded blocks), matching PAGE_LOADERS;
 *   - maps each CMS section name to the `__resolveType` key resolveSection expects
 *     (e.g. `MultipleImageBanner` → `site/sections/Banners/MultipleImageBanner.tsx`);
 *   - reports any section whose component is not registered in resolveSection, as a
 *     checklist of what still needs migrating.
 *
 * Source API (same the runtime CmsService uses):
 *   https://{workspace}--{account}.myvtex.com/_v/cms/api/{project}/{contentType}
 *
 * Usage (from the shared app root):
 *   npm run deco:import
 *   node scripts/deco-import/import-vtex-cms.mjs --dry-run
 *   VTEX_ACCOUNT=YOUR_VTEX_ACCOUNT VTEX_WORKSPACE=master VTEX_CMS_PROJECT=app-eitri npm run deco:import
 *
 * Approach ported from agencia-e-plus/faststoretorra (scripts/deco/import-faststore-cms.ts),
 * adapted to the Eitri fixed-filename + manual-section-map contract.
 */
import { mkdir, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const DEFAULT_ACCOUNT = 'YOUR_VTEX_ACCOUNT'
const DEFAULT_WORKSPACE = 'master'
const DEFAULT_PROJECT = 'app-eitri'
const OUT_DIR = '.deco/blocks'
const STAGING_DIR = '.deco/.blocks-import'

/**
 * CMS content-type id → Deco page name. The page name drives both the block
 * filename (`pages-<PageName>.json`) and the `name` field, and MUST match a key
 * registered in DecoCMSContentRender's PAGE_LOADERS for the runtime to load it.
 */
const CONTENT_TYPE_TO_PAGE = {
	home: { pageName: 'Home', path: '/' },
	categories: { pageName: 'Categories', path: '/categories' },
}

/**
 * CMS section name → resolveSection key (path under `site/sections/`, no extension).
 * Only sections that live in a subfolder or use an alias need an entry; anything
 * omitted maps to `site/sections/<name>.tsx` (name unchanged).
 */
const SECTION_PATH_OVERRIDES = {
	MultipleImageBanner: 'Banners/MultipleImageBanner',
	Hero: 'Banners/Hero',
}

/** Optional Draft.js → HTML conversion; only used if `draftjs-to-html` is installed. */
let draftToHtml = null
try {
	const mod = await import('draftjs-to-html')
	draftToHtml = mod.default ?? mod
} catch {
	// Dependency not installed — raw Draft.js values are preserved untouched.
}

function isRecord(value) {
	return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function isRawDraftContent(value) {
	return isRecord(value) && Array.isArray(value.blocks) && isRecord(value.entityMap)
}

function convertDraftValues(value, backups, fieldPath = '') {
	if (draftToHtml && typeof value === 'string' && value.trimStart().startsWith('{')) {
		try {
			const parsed = JSON.parse(value)
			if (isRawDraftContent(parsed)) {
				backups.push({ path: fieldPath, value })
				return draftToHtml(parsed)
			}
		} catch {
			// A normal string beginning with "{" is not migration metadata.
		}
	}

	if (Array.isArray(value)) {
		return value.map((child, index) => convertDraftValues(child, backups, `${fieldPath}[${index}]`))
	}

	if (isRecord(value)) {
		return Object.fromEntries(
			Object.entries(value).map(([key, child]) => [
				key,
				convertDraftValues(child, backups, fieldPath ? `${fieldPath}.${key}` : key),
			]),
		)
	}

	return value
}

function sectionResolveKey(name) {
	return SECTION_PATH_OVERRIDES[name] ?? name
}

function sectionResolveType(name) {
	return `site/sections/${sectionResolveKey(name)}.tsx`
}

function documentToBlock(document, contentType, pageName, pagePath) {
	const drafts = []

	return {
		__resolveType: 'website/pages/Page.tsx',
		name: pageName,
		path: pagePath,
		sections: (document.sections ?? []).map((section, sectionIndex) => ({
			...convertDraftValues(section.data ?? {}, drafts, `sections[${sectionIndex}].data`),
			__resolveType: sectionResolveType(section.name),
		})),
		...(isRecord(document.settings?.seo) ? { seo: document.settings.seo } : {}),
		__cms: {
			source: 'vtex-headless-cms',
			contentType,
			documentId: document.id,
			versionId: document.versionId ?? null,
			status: document.status ?? 'published',
			versionStatus: document.versionStatus ?? 'published',
			...(drafts.length > 0 ? { draftjs: drafts } : {}),
		},
	}
}

async function fetchType(baseUrl, contentType, perPage = 100) {
	const documents = []

	for (let page = 1; ; page++) {
		const url = new URL(`${baseUrl}/${contentType}`)
		url.searchParams.set('page', String(page))
		url.searchParams.set('per_page', String(perPage))
		const response = await fetch(url)
		if (!response.ok) throw new Error(`${contentType} page ${page}: HTTP ${response.status}`)

		const payload = await response.json()
		const pageDocuments = payload.data ?? []
		documents.push(...pageDocuments)
		if (documents.length >= (payload.totalItems ?? 0) || pageDocuments.length === 0) return documents
	}
}

/** Parse the keys registered in resolveSection.ts, to flag unresolved sections. */
async function loadRegisteredSectionKeys(projectRoot) {
	try {
		const source = await readFile(
			path.join(projectRoot, 'src/utils/resolveSection.ts'),
			'utf8',
		)
		const body = source.slice(source.indexOf('SECTION_MAP'))
		const keys = new Set()
		for (const match of body.matchAll(/^\s*'([^']+)'\s*:/gm)) keys.add(match[1])
		return keys
	} catch {
		return null
	}
}

async function main() {
	const dryRun = process.argv.slice(2).includes('--dry-run')
	const account = process.env.VTEX_ACCOUNT ?? process.env.NEXT_PUBLIC_STORE_ID ?? DEFAULT_ACCOUNT
	const workspace = process.env.VTEX_WORKSPACE ?? DEFAULT_WORKSPACE
	const project = process.env.VTEX_CMS_PROJECT ?? DEFAULT_PROJECT
	const baseUrl =
		process.env.VTEX_CMS_BASE_URL ?? `https://${workspace}--${account}.myvtex.com/_v/cms/api/${project}`
	const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
	const outDir = path.join(projectRoot, OUT_DIR)
	const stagingDir = path.join(projectRoot, STAGING_DIR)

	console.log(`deco import: source ${baseUrl}`)

	const registeredSections = await loadRegisteredSectionKeys(projectRoot)
	const blocks = new Map()
	const unresolved = new Set()

	for (const [contentType, { pageName, path: pagePath }] of Object.entries(CONTENT_TYPE_TO_PAGE)) {
		const documents = await fetchType(baseUrl, contentType)
		if (documents.length === 0) {
			console.warn(`deco import: no document for content type "${contentType}" — skipping ${pageName}`)
			continue
		}
		if (documents.length > 1) {
			console.warn(
				`deco import: content type "${contentType}" returned ${documents.length} docs; using the first ("${documents[0].name}")`,
			)
		}

		const document = documents[0]
		const block = documentToBlock(document, contentType, pageName, pagePath)
		blocks.set(`pages-${pageName}`, block)

		if (registeredSections) {
			for (const section of document.sections ?? []) {
				if (!registeredSections.has(sectionResolveKey(section.name))) unresolved.add(section.name)
			}
		}

		console.log(`deco import: ${contentType} → pages-${pageName}.json (${(document.sections ?? []).length} section(s))`)
	}

	if (blocks.size === 0) throw new Error('Refusing to write: no documents imported')

	if (unresolved.size > 0) {
		console.warn(
			`deco import: ${unresolved.size} section(s) NOT registered in resolveSection (won't render): ${[...unresolved].join(', ')}`,
		)
	}

	if (dryRun) {
		console.log(`deco import: --dry-run, nothing written (${blocks.size} block(s) would be generated)`)
		return
	}

	await rm(stagingDir, { force: true, recursive: true })
	await mkdir(stagingDir, { recursive: true })
	await Promise.all(
		Array.from(blocks).map(([key, block]) =>
			writeFile(path.join(stagingDir, `${key}.json`), `${JSON.stringify(block, null, 2)}\n`),
		),
	)

	await mkdir(outDir, { recursive: true })
	for (const filename of await readdir(stagingDir)) {
		await rename(path.join(stagingDir, filename), path.join(outDir, filename))
	}
	await rm(stagingDir, { recursive: true })

	const draftCount = Array.from(blocks.values()).reduce(
		(total, block) => total + (block.__cms.draftjs?.length ?? 0),
		0,
	)
	console.log(`deco import: wrote ${blocks.size} page block(s) → ${OUT_DIR}`)
	console.log(
		draftToHtml
			? `deco import: converted ${draftCount} Draft.js value(s) to HTML (raw values retained in __cms.draftjs)`
			: `deco import: draftjs-to-html not installed — Draft.js rich text left as raw JSON`,
	)
	console.log('deco import: run "npm run deco:generate" to refresh the Deco schema/meta.')
}

const invokedDirectly = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
if (invokedDirectly) {
	main().catch(error => {
		console.error(error)
		process.exit(1)
	})
}
