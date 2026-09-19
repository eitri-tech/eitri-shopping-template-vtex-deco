import { useState, useEffect } from 'react'
import { Page, View } from 'eitri-luminus'
import Eitri from 'eitri-bifrost'
import { useLocalShoppingCart } from '../providers/LocalCart'
import { useSnackBar } from '../providers/SnackBar'
import { startConfigure } from '../services/AppService'
import HomeSkeleton from '../components/HomeSkeleton/HomeSkeleton'
import MainHeader from '../components/Header/MainHeader'
import {
	BottomInset,
	TrackingService,
	Loading,
	DecoCMSContentRender,
	useBiometricLogin,
	BiometricReauthModal,
	useRetractableBottomBar,
	refreshContactKeyIfStale
} from 'eitri-shopping-template-vtex-deco-shared'
import { doLogin, isLoggedIn } from '../services/CustomerService'
import { handleReservedPathDeeplink } from '../utils/deeplinkFallback'

// Matches shared's CmsDependencies UseLocalShoppingCart/UseSnackBar contract (not re-exported
// from the shared package's public export.ts, so redeclared locally). That contract types
// addItem/showSnackBar as required, but this app's provider hooks type them optional (undefined
// before mount) — by the time DecoCMSContentRender renders, the providers are always mounted.
type UseLocalShoppingCartForCms = () => { cart?: any; addItem: (payload: any) => Promise<any>; [key: string]: any }
type UseSnackBarForCms = () => { showSnackBar: (type: string, message: string) => void; [key: string]: any }
const useLocalShoppingCartForCms = useLocalShoppingCart as unknown as UseLocalShoppingCartForCms
const useSnackBarForCms = useSnackBar as unknown as UseSnackBarForCms

// Eitri.getInitializationInfos()'s .d.ts declares the return type as the bare `Object` (no
// members) — a library typing gap, not a real "any shape" API. This models the field this app
// actually reads.
interface InitializationInfos {
	route?: string
	[key: string]: unknown
}

interface DeepLinkRoute {
	path: string
	state: Record<string, unknown>
	replace: true
}

export default function Home() {
	const { startCart } = useLocalShoppingCart()
	useRetractableBottomBar()
	const [enableCmsQuery, setEnableCmsQuery] = useState(false)
	const [cmsReady, setCmsReady] = useState(false)
	const [initialLoading, setInitialLoading] = useState(true)

	const { attemptBiometricLogin, showReauthModal, reauthEmail, handleReauthConfirm, dismissReauthModal } =
		useBiometricLogin({
			doLogin,
			isLoggedIn,
			onSuccess: () => startCart?.()
		})

	useEffect(() => {
		startHome()
		requestNotificationPermission()
		Eitri.navigation.addOnResumeListener(() => {
			startCart?.()
			refreshContactKeyIfStale()
		})
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const requestNotificationPermission = async () => {
		try {
			const notificationPermissionStatus = await Eitri.notification.checkPermission()
			if (notificationPermissionStatus.status === 'DENIED') {
				await Eitri.notification.requestPermission({})
			}
		} catch (e) {
			console.error('Erro ao solicitar permissão para notificação', e)
		}
	}

	const startHome = async () => {
		const startParams = (await Eitri.getInitializationInfos()) as InitializationInfos | undefined
		if (!startParams?.route) {
			setInitialLoading(false)
		}

		try {
			await startConfigure()
		} catch (e) {
			console.error('Erro startConfigure: ', e)
		}

		await resolveRedirectAndCartAndCms()
	}

	const resolveRedirectAndCartAndCms = async () => {
		const startParams = (await Eitri.getInitializationInfos()) as InitializationInfos | undefined
		if (startParams) {
			// Link do site sem tela nativa equivalente (rota de API, checkout web,
			// carrinho compartilhado): vai pro destino certo em vez de cair no chute de
			// categoria do resolver, que renderiza uma PLP vazia.
			const handled = await handleReservedPathDeeplink(startParams)

			if (!handled) {
				const openRoute = processDeepLink(startParams)
				if (openRoute) {
					Eitri.navigation.navigate(openRoute)
					return
				}
			}
		}
		setEnableCmsQuery(true)
		startCart?.()
		await attemptBiometricLogin()
		// Fire-and-forget: promove a contact key de e-mail para codigo de cliente
		// quando o codigo passar a existir. E aqui, e nao so na aba Perfil, porque
		// esta e a tela em que a maioria das aberturas do app cai. Tem guarda de
		// sessao e janela de 1h, entao e no-op na maioria das aberturas, e nunca
		// bloqueia a renderizacao.
		refreshContactKeyIfStale()
		TrackingService.sendScreenView('Página inicial', 'Home')
		TrackingService.insiderVisitHomepage()
	}

	const processDeepLink = (startParams: InitializationInfos): DeepLinkRoute | undefined => {
		if (startParams?.route) {
			const { route, ...rest } = startParams
			return {
				path: route,
				state: rest,
				replace: true
			}
		}
	}

	if (initialLoading) {
		return <Loading fullScreen />
	}

	return (
		<Page title='Página inicial'>
			{cmsReady && <MainHeader />}
			<View>
				{/* Só renderiza o CMS depois que a VTEX foi configurada (startConfigure).
				    Sem esse gate as seções que buscam produtos (ProductShelf/BannerWithShelf)
				    disparam Vtex.searchGraphql.productSearch antes do App.tryAutoConfigure
				    resolver e voltam vazias. */}
				{enableCmsQuery && (
					<DecoCMSContentRender
						page='Home'
						useLocalShoppingCart={useLocalShoppingCartForCms}
						useSnackBar={useSnackBarForCms}
						onReady={() => setCmsReady(true)}
					/>
				)}
				<BottomInset />
				<BottomInset />
			</View>
			<HomeSkeleton show={!cmsReady} />

			<BiometricReauthModal
				show={showReauthModal}
				email={reauthEmail}
				onConfirm={handleReauthConfirm}
				onDismiss={dismissReauthModal}
			/>
		</Page>
	)
}
