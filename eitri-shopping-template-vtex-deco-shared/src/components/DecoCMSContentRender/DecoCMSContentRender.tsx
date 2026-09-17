import { Text, View } from 'eitri-luminus'
import resolveSection from '../../utils/resolveSection'
import { useState, useEffect, type ReactNode } from 'react'
import CmsDependenciesProvider from '../../providers/CmsDependencies'
import ensureVtexConfigured from '../../utils/ensureVtexConfigured'
import type { UseLocalShoppingCart, UseSnackBar, CmsAuth } from '../../sections/types'
import { setBottomBarVisible } from '../../hooks/useRetractableBottomBar'

interface Section {
	__resolveType: string
	[key: string]: unknown
}

interface PageContent {
	name?: string
	path?: string
	sections?: Section[]
	__resolveType?: string
}

// O Eitri só empacota o `import()` quando o caminho é string literal fixa;
// caminho montado por variável não é resolvido. Uma entrada por página.
const PAGE_LOADERS: Record<string, () => Promise<{ default: PageContent }>> = {
	Home: () => import('../../../.deco/blocks/pages-Home.json') as Promise<{ default: PageContent }>,
	Categories: () => import('../../../.deco/blocks/pages-Categories.json') as Promise<{ default: PageContent }>,
	BoasVindas: () => import('../../../.deco/blocks/pages-BoasVindas.json') as Promise<{ default: PageContent }>,
	Login: () => import('../../../.deco/blocks/pages-Login.json') as Promise<{ default: PageContent }>,
	SignUp: () => import('../../../.deco/blocks/pages-SignUp.json') as Promise<{ default: PageContent }>,
	Favoritos: () => import('../../../.deco/blocks/pages-Favoritos.json') as Promise<{ default: PageContent }>
}

export interface Props {
	/**
	 * @title Nome da página no deco (ex.: "Home").
	 */
	page: string
	/**
	 * TEMPORÁRIO — hooks injetados pelo app consumidor (ex.: home) e repassados às
	 * seções via `CmsDependencies`. Evolução: mover para o `__main__.jsx` de cada app.
	 */
	useLocalShoppingCart?: UseLocalShoppingCart
	useSnackBar?: UseSnackBar
	/**
	 * TEMPORÁRIO — ações/estado de login injetados pelo app consumidor (account) e
	 * repassados às seções de login via `CmsDependencies`.
	 */
	auth?: CmsAuth
	/**
	 * Placeholder exibido enquanto o JSON da pagina e carregado e a VTEX e
	 * configurada. Permite reaproveitar o skeleton ja usado pelo app consumidor
	 * (ex.: HomeSkeleton) em vez do texto generico Carregando...
	 * Quando omitido, nada e renderizado nesse intervalo.
	 */
	renderLoading?: () => ReactNode
	onReady?: () => void
}

/**
 * Renderiza o conteúdo de uma página do CMS Deco a partir do seu nome.
 *
 * Carrega o JSON da página sob demanda via `PAGE_LOADERS` e renderiza cada
 * seção resolvendo o componente correspondente via `resolveSection`
 */
export default function DecoCMSContentRender({ page, useLocalShoppingCart, useSnackBar, auth, renderLoading, onReady }: Props) {
	const [loading, setLoading] = useState(true)
	const [content, setContent] = useState<PageContent | null>(null)

	useEffect(() => {
		setBottomBarVisible(false)
	}, [])

	useEffect(() => {
		const loader = PAGE_LOADERS[page]

		if (!loader) {
			console.warn(`[DecoCMSContentRender] Nenhuma página registrada para "${page}"`)
			setContent(null)
			setLoading(false)
			setBottomBarVisible(true)
			return
		}

		// Evita aplicar o resultado de um carregamento obsoleto caso `page`
		// mude antes do import assíncrono resolver.
		let active = true
		setLoading(true)

		// Configura a VTEX (contexto shared) antes de aplicar o conteúdo, para que as
		// seções só montem — e disparem buscas no Intelligent Search — com a VTEX pronta.
		Promise.all([loader(), ensureVtexConfigured()])
			.then(([module]) => {
				if (!active) return
				setContent(module.default)
			})
			.catch(error => {
				if (!active) return
				console.error(`[DecoCMSContentRender] Falha ao carregar a página "${page}"`, error)
				setContent(null)
			})
			.finally(() => {
				if (active) {
					setLoading(false)
					setBottomBarVisible(true)
					onReady?.()
				}
			})

		return () => {
			active = false
		}
	}, [page])

	if (loading) {
		return renderLoading ? <>{renderLoading()}</> : null
	}

	if (!content) {
		return (
			<View
				width='100%'
				className='p-4 bg-error/10 flex flex-col'>
				<Text className='text-sm font-semibold text-error'>Página não encontrada</Text>
				<Text className='text-xs text-base-content/60'>{page}</Text>
			</View>
		)
	}

	const realSections = Array.isArray(content?.sections) ? content.sections : []

	const sections = [...realSections]

	// TEMPORÁRIO — disponibiliza os hooks de carrinho/snackbar injetados pelo app
	// consumidor para as seções (via CmsDependencies), sem prop-drilling. Evolução:
	// mover a montagem dos providers para o `__main__.jsx` de cada app.
	return (
		<CmsDependenciesProvider
			useLocalShoppingCart={useLocalShoppingCart}
			useSnackBar={useSnackBar}
			auth={auth}>
			<View width='100%' className='flex flex-col gap-9'>
				{sections.map((section, index) => {
					const Section = resolveSection(section.__resolveType)

					if (!Section) {
						return null
					}

					const { __resolveType, ...props } = section

					return (
						<Section
							key={index}
							{...props}
						/>
					)
				})}
			</View>
		</CmsDependenciesProvider>
	)
}
