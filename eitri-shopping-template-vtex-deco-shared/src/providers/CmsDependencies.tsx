import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import type { UseLocalShoppingCart, UseSnackBar, CmsAuth } from '../sections/types'

/**
 * TEMPORÁRIO — injeção de dependências para as seções do CMS.
 *
 * O app consumidor passa seus hooks (`useLocalShoppingCart`, `useSnackBar`) para o
 * `DecoCMSContentRender`, que os disponibiliza aqui. As seções (ProductCard,
 * NewsLetter…) consomem via os hooks-proxy abaixo, evitando prop-drilling em N
 * níveis. Assim o shared não força nenhum provider próprio.
 *
 * Evolução: quando cada app declarar um `src/providers/__main__.jsx` (MainProvider —
 * https://docs.eitri.tech/en/concepts/eitri-app/#mainprovider) montando os providers
 * do shared, este proxy pode ser removido e as seções passam a usar os hooks direto.
 */

interface CmsDependencies {
	useLocalShoppingCart: UseLocalShoppingCart
	useSnackBar: UseSnackBar
	auth: CmsAuth
}

// Fallbacks no-op: sem injeção, as seções renderizam sem quebrar (sem carrinho/snackbar).
const noopCart: UseLocalShoppingCart = () => ({ cart: null, addItem: async () => undefined })
const noopSnackBar: UseSnackBar = () => ({ showSnackBar: () => undefined })
const noopAuth: CmsAuth = {}

const CmsDependenciesContext = createContext<CmsDependencies>({
	useLocalShoppingCart: noopCart,
	useSnackBar: noopSnackBar,
	auth: noopAuth
})

export interface CmsDependenciesProviderProps {
	useLocalShoppingCart?: UseLocalShoppingCart
	useSnackBar?: UseSnackBar
	auth?: CmsAuth
	children: ReactNode
}

export default function CmsDependenciesProvider({
	useLocalShoppingCart = noopCart,
	useSnackBar = noopSnackBar,
	auth = noopAuth,
	children
}: CmsDependenciesProviderProps) {
	return (
		<CmsDependenciesContext.Provider value={{ useLocalShoppingCart, useSnackBar, auth }}>
			{children}
		</CmsDependenciesContext.Provider>
	)
}

// Hooks-proxy — só repassam o hook injetado pelo app consumidor.
export function useLocalShoppingCart() {
	return useContext(CmsDependenciesContext).useLocalShoppingCart()
}

export function useSnackBar() {
	return useContext(CmsDependenciesContext).useSnackBar()
}

// Ações/estado de autenticação injetados pelo app (account). As seções de login consomem daqui.
export function useCmsAuth(): CmsAuth {
	return useContext(CmsDependenciesContext).auth
}
