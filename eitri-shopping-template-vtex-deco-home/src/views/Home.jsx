import Eitri from 'eitri-bifrost'
import { useLocalShoppingCart } from '../providers/LocalCart'
import { useSnackBar } from '../providers/SnackBar'
import { startConfigure } from '../services/AppService'
import HomeSkeleton from '../components/HomeSkeleton/HomeSkeleton'
import MainHeader from '../components/Header/MainHeader'
import { BottomInset, TrackingService, Loading, DecoCMSContentRender, useBiometricLogin, BiometricReauthModal, useRetractableBottomBar, refreshContactKeyIfStale } from 'eitri-shopping-template-vtex-deco-shared'
import { useEffect, useState } from 'react'
import { Page, View } from 'eitri-luminus'
import { doLogin, isLoggedIn } from '../services/CustomerService'
import { handleReservedPathDeeplink } from '../utils/deeplinkFallback'

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
			onSuccess: () => startCart()
		})

	useEffect(() => {
		startHome()
		requestNotificationPermission()
		Eitri.navigation.addOnResumeListener(() => {
			startCart()
			refreshContactKeyIfStale()
		})
	}, [])

	const requestNotificationPermission = async () => {
		try {
			let notificationPermissionStatus = await Eitri.notification.checkPermission()
			if (notificationPermissionStatus.status === 'DENIED') {
				await Eitri.notification.requestPermission({})
			}
		} catch (e) {
			console.error('Erro ao solicitar permissão para notificação', e)
		}
	}

	const startHome = async () => {
		const startParams = await Eitri.getInitializationInfos()
		if (!startParams?.route) {
			setInitialLoading(false)
		}

		startConfigure()
			.then(resolveRedirectAndCartAndCms)
			.catch(e => {
				console.error('Erro startConfigure: ', e)
			})
	}

	const resolveRedirectAndCartAndCms = async () => {
		const startParams = await Eitri.getInitializationInfos()
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
		startCart()
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

	const processDeepLink = startParams => {
		if (startParams?.route) {
			let { route, ...rest } = startParams
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
						useLocalShoppingCart={useLocalShoppingCart}
						useSnackBar={useSnackBar}
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
