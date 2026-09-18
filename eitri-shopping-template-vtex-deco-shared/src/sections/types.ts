/**
 * Tipos compartilhados pelas seções do CMS Deco.
 * Ver docs/CMS_SECTIONS_MIGRATION.md.
 */

import type { ImageWidget } from '../types/widgets'

export interface Facet {
	key: string
	value: string
}

/**
 * Ação de clique resolvida por `services/ResolveCmsActions`.
 */
export interface CmsAction {
	/** @title Tipo de ação */
	type: 'search' | 'collection' | 'page' | 'category' | 'product' | 'path' | 'brand' | 'link' | 'facets' | 'none'
	/** @title Valor (id/slug/caminho/termo) */
	value?: string
	sort?: string
	/** @title Título de destino */
	title?: string
	facets?: Facet[]
	banner?: string
	categoryNames?: string[]
}

/**
 * Item de FAQ (accordion "Perguntas Frequentes"). Sem `answer`, o item abre
 * `url` em vez de expandir inline.
 */
export interface FaqItem {
	/** @title Pergunta */
	question: string
	/** @title Resposta (deixe vazio para abrir um link em vez de expandir) */
	answer?: string
	/** @title Link (usado quando não há resposta) */
	url?: string
}

export type BannerMode =
	| 'SliderHero'
	| 'BannerList'
	| 'RoundedBannerList'
	| 'GridList'
	| 'SingleBanner'
	| 'FitOnScreen'
	| 'FullScreen'

export interface BannerImage {
	/** @title URL da imagem */
	imageUrl?: ImageWidget
	externalImageUrl?: string
	action?: CmsAction
	sort?: string
	subLabel?: string
	mktTag?: string
}

export interface BannerSize {
	maxWidth?: number
	maxHeight?: number
}

/**
 * Shape interno repassado aos sub-componentes de banner (equivalente ao antigo
 * objeto `data` do CMS legado).
 */
export interface BannerData {
	images?: BannerImage[]
	mode?: BannerMode
	autoPlay?: boolean
	autoPlayTimeout?: number
	aspectRatio?: string
	mainTitle?: string
	size?: BannerSize
	gap?: number
	autoSize?: string
}

/**
 * TEMPORÁRIO — hooks injetados pelo app consumidor no `DecoCMSContentRender` e
 * repassados às seções via o provider `CmsDependencies` (proxy). Assim o shared
 * não depende de um provider específico — o host decide de onde vêm carrinho/
 * snackbar. Evolução: mover para um `src/providers/__main__.jsx` (MainProvider)
 * em cada app e consumir os providers direto do shared.
 */
export type UseLocalShoppingCart = () => {
	cart?: any
	addItem: (payload: any) => Promise<any>
	[key: string]: any
}

export type UseSnackBar = () => {
	showSnackBar: (type: string, message: string) => void
	[key: string]: any
}

/**
 * TEMPORÁRIO — ações/estado de autenticação injetados pelo app consumidor (account)
 * no `DecoCMSContentRender` e repassados às seções de login (ex.: WelcomeLoginOptions)
 * via `CmsDependencies`. O app resolve provedores/plataforma e injeta os handlers
 * prontos; a seção só decide quais botões mostrar e dispara o handler ao clicar.
 */
export interface CmsAuth {
	/** Exibir o botão "Entrar com o Google" (o app já resolveu plataforma/disponibilidade). */
	showGoogle?: boolean
	/** Exibir o botão "Entrar com E-mail e senha". */
	showEmailPassword?: boolean
	onEmailCode?: () => void
	onGoogle?: () => void
	onEmailPassword?: () => void
	onRegister?: () => void
}
