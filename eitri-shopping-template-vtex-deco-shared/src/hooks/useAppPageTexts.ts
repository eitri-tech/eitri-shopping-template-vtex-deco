import { useEffect, useState } from 'react'

type PageTexts = Record<string, string>

interface PageContent {
	sections?: Array<Record<string, unknown>>
}

// O Eitri só empacota o `import()` quando o caminho é string literal fixa;
// caminho montado por variável não é resolvido. Uma entrada por página.
const PAGE_LOADERS: Record<string, () => Promise<{ default: PageContent }>> = {
	BoasVindas: () => import('../../.deco/blocks/pages-BoasVindas.json') as Promise<{ default: PageContent }>,
	Login: () => import('../../.deco/blocks/pages-Login.json') as Promise<{ default: PageContent }>,
	Favoritos: () => import('../../.deco/blocks/pages-Favoritos.json') as Promise<{ default: PageContent }>,
	SignUp: () => import('../../.deco/blocks/pages-SignUp.json') as Promise<{ default: PageContent }>
}

/**
 * Carrega os textos editáveis de uma página do painel (Deco) a partir do bloco
 * `.deco/blocks/pages-<page>.json` e os devolve como um objeto plano.
 *
 * O bloco segue o mesmo formato das páginas Home/Categories (`website/pages/Page.tsx`
 * com um array `sections`); aqui cada página tem uma única seção de textos, então
 * lemos os `Props` de `sections[0]`.
 *
 * As views nativas consomem cada campo com fallback para o i18n atual, então,
 * enquanto o bloco carrega — ou se ele falhar — o texto exibido é o de sempre:
 * `texts.title ?? t('...')`.
 *
 * `sectionIndex` (padrão 0) permite ler outras seções da mesma página quando
 * ela tem mais de uma (ex.: FaqSection/HelpSection anexadas depois do
 * formulário principal) — usado direto como props do componente daquela
 * seção, sem passar pelo fallback i18n.
 */
export default function useAppPageTexts(page: string, sectionIndex = 0): PageTexts {
	const [texts, setTexts] = useState<PageTexts>({})

	useEffect(() => {
		const loader = PAGE_LOADERS[page]

		if (!loader) {
			console.warn(`[useAppPageTexts] Nenhuma página registrada para "${page}"`)
			return
		}

		let active = true

		loader()
			.then(module => {
				if (!active) return
				const section = module.default?.sections?.[sectionIndex] ?? {}
				const { __resolveType, ...rest } = section as Record<string, unknown>
				setTexts(rest as PageTexts)
			})
			.catch(error => {
				console.error(`[useAppPageTexts] Falha ao carregar os textos da página "${page}"`, error)
			})

		return () => {
			active = false
		}
	}, [page, sectionIndex])

	return texts
}
