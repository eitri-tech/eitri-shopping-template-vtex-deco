import { useState, useEffect } from 'react'
import { Page, View, Text, Image } from 'eitri-luminus'
import iconGoogle from '../assets/images/social_google.svg'
import lockIcon from '../assets/icons/lock.svg'
import { MdOutlineFeaturedVideo } from "react-icons/md";
import Eitri from 'eitri-bifrost'
import {
	Loading,
	HeaderContentWrapper,
	HeaderText,
	HeaderReturn,
	BottomInset,
	TrackingService,
	MailIcon,
	Datadog
} from 'eitri-shopping-template-vtex-deco-shared'
import {
	isLoggedIn,
	loginWithGoogle
} from '../services/CustomerService'
import Alert from '../components/Alert/Alert'
import { sendScreenView } from '../services/TrackingService'
import { navigate, PAGES } from '../services/NavigationService'
import { useTranslation } from 'eitri-i18n'
import { getLoginProviders } from '../services/StoreService'
import HelpSection from '../components/HelpSection/HelpSection'
import type { RouteProps } from '../types/route'

interface LoginProviders {
	oAuthProviders?: Array<{ providerName?: string;[key: string]: unknown }>
	passwordAuthentication?: boolean
	[key: string]: unknown
}

interface SignInVariantLocationState {
	redirectTo?: string
	redirectState?: any
	closeAppAfterLogin?: boolean
	[key: string]: unknown
}

interface SignInVariantProps extends RouteProps<SignInVariantLocationState> {
	defaultAfterLogin?: string
	[key: string]: unknown
}

export default function SignInVariant(props: SignInVariantProps) {
	const { t } = useTranslation()
	const redirectTo = props?.location?.state?.redirectTo
	const redirectState = props?.location?.state?.redirectState
	const closeAppAfterLogin = props?.location?.state?.closeAppAfterLogin
	const defaultAfterLogin = props?.defaultAfterLogin || 'feature'
	const isWelcomeFlow = defaultAfterLogin !== 'back'
	const openedFromBottomTab = redirectState?.tabIndex !== undefined && redirectState?.tabIndex !== null

	const [loading, setLoading] = useState(false)
	const [showLoginErrorAlert, setShowLoginErrorAlert] = useState(false)
	const [loginProviders, setLoginProviders] = useState<LoginProviders | null | undefined>()
	const [loadingProviders, setLoadingProviders] = useState(true)
	const [isIOS, setIsIOS] = useState(false)
	const [canUseSocialLogin, setCanUseSocialLogin] = useState(false)

	useEffect(() => {
		initialize()
		Eitri.navigation.setOnResumeListener(redirectLoggedUser)
	}, [])

	const initialize = async () => {
		if (await redirectLoggedUser()) return

		await detectPlatform()
		await loadLoginProviders()
		sendScreenView('Login', 'SignInVariant')
	}

	// Social login (Google/Apple) doesn't work in the iOS WebView, so it must
	// never be offered there — email login remains the only path on iOS.
	const detectPlatform = async () => {
		try {
			const { platform } = await Eitri.device.getInfos()
			setIsIOS(platform === 'ios')
		} catch (error) {
			console.error('Erro ao verificar plataforma do dispositivo', error)
		}
	}

	const redirectLoggedUser = async () => {
		try {
			if (!(await isLoggedIn())) return false
			setLoading(true)
			await onLoggedIn()
			return true
		} catch (error) {
			console.error('Erro ao verificar sessão antes de redirecionar o usuário', error)
			return false
		}
	}

	// O login social usa o módulo nativo vtexOAuth (Android Custom Tabs). Sem um provider
	// de Custom Tabs instalado, isAvailable() retorna false e o vtex-shared desiste em
	// silêncio — por isso o botão só pode ser exibido quando isso for verdadeiro.
	const resolveSocialLoginAvailability = async () => {
		try {
			const modules = await Eitri.modules()
			const isAvailable = (modules as any)?.vtexOAuth?.isAvailable
			if (!isAvailable) return false
			return await isAvailable()
		} catch (error) {
			console.error('Erro ao verificar disponibilidade do login social', error)
			return false
		}
	}

	const loadLoginProviders = async () => {
		try {
			const [providers, socialLoginAvailable] = await Promise.all([
				getLoginProviders(),
				resolveSocialLoginAvailability()
			])
			setLoginProviders(providers)
			setCanUseSocialLogin(socialLoginAvailable)
		} catch (e) {
			console.error('Erro ao carregar provedores de login', e)
		} finally {
			setLoadingProviders(false)
		}
	}

	const onLoggedIn = async () => {
		if (redirectTo) {
			const path = redirectTo.startsWith('/') ? redirectTo : `/${redirectTo}`
			return navigate(path, redirectState, true)
		}
		if (closeAppAfterLogin) {
			return Eitri.close()
		}
		if (defaultAfterLogin === 'back') {
			return Eitri.navigation.back()
		}
		return navigate(PAGES.FEATURE, {}, true)
	}

	const handleSocialLogin = async (executor: () => Promise<any>, method: string) => {
		setLoading(true)
		setShowLoginErrorAlert(false)
		try {
			await executor()
			TrackingService.loginEvent(method).catch(error => {
				console.error('Erro ao registrar evento de login social', error)
			})
			await onLoggedIn()
		} catch (error: any) {
			console.error(`Erro ao entrar com ${method}`, error)
			Datadog.sendDatadogLogError(error as any, 'handleSocialLogin', { screen: 'SignInVariant', provider: method })
			setShowLoginErrorAlert(true)
		} finally {
			setLoading(false)
		}
	}

	const goToEmailLogin = (loginMode: string) => {
		const emailRedirectTo = redirectTo || (defaultAfterLogin === 'feature' ? PAGES.FEATURE : undefined)
		navigate(PAGES.SIGNIN, {
			redirectTo: emailRedirectTo,
			redirectState,
			closeAppAfterLogin,
			loginMode
		})
	}

	const goToSignUp = () => {
		navigate(PAGES.SIGNUP, { fromWelcome: isWelcomeFlow, redirectTo, closeAppAfterLogin })
	}

	const hasGoogle = !isIOS && canUseSocialLogin && Boolean(loginProviders?.oAuthProviders?.some(p => p.providerName === 'Google'))

	return (
		<Page
			title={t('signInVariant.headerText')}
			topInset>
			<HeaderContentWrapper containerClassName='shadow-none'>
				{!openedFromBottomTab && (
					<HeaderReturn onClick={() => {
						if (isWelcomeFlow) {
							TrackingService.selectContentEvent({ content_type: 'welcome_modal', content_id: 'back_from_sign_in_variant' })
						}
						Eitri.navigation.back()
					}} />
				)}
				<View className='absolute left-0 right-0 flex justify-center pointer-events-none'>
					<HeaderText text={t('signInVariant.headerText')} />
				</View>
			</HeaderContentWrapper>

			<Loading
				fullScreen
				isLoading={loadingProviders || loading}
			/>

			<View className='px-4 mt-4'>
				<View className='border border-gray-200 rounded-lg p-4 flex flex-row gap-3 items-start'>
					<MdOutlineFeaturedVideo
						className='text-primary-content'
						size={20}
					/>
					<View className='flex flex-col flex-1'>
						<Text className='font-bold text-base text-black'>{t('signInVariant.featureTitle')}</Text>
						<Text className='text-sm text-gray-600 mt-1 leading-5'>{t('signInVariant.featureDescription')}</Text>
					</View>
				</View>

				<View className='mt-6 mb-6 flex flex-col items-center'>
					<Text className="text-gray-600 text-center text-sm leading-relaxed px-2" >
						{t('signInVariant.subtitle')}
					</Text>
				</View>

				<View className='flex flex-col gap-3'>
					<View
						className='flex flex-row items-center justify-center gap-3 h-12 rounded-lg border border-gray-300'
						onClick={() => goToEmailLogin('emailAndAccessKey')}>
						<MailIcon
							size={20}
							className='text-gray-700'
						/>
						<Text className='text-gray-700 font-medium'>{t('signInVariant.emailCodeButton')}</Text>
					</View>

					{hasGoogle && (
						<View
							className='flex flex-row items-center justify-center gap-3 h-12 rounded-lg border border-gray-300'
							onClick={() => handleSocialLogin(loginWithGoogle, 'google')}>
							<Image
								src={iconGoogle}
								width='20px'
								height='20px'
							/>
							<Text className='text-gray-700 font-medium'>{t('signInVariant.googleButton')}</Text>
						</View>
					)}

					{loginProviders?.passwordAuthentication && (
						<View
							className='flex flex-row items-center justify-center gap-3 h-12 rounded-lg border border-gray-300'
							onClick={() => goToEmailLogin('emailAndPassword')}>
							<Image
								src={lockIcon}
								width='20px'
								height='20px'
							/>
							<Text className='text-gray-700 font-medium'>{t('signInVariant.emailPasswordButton')}</Text>
						</View>
					)}
				</View>

				<View className='mt-5 flex flex-row items-center justify-center gap-1'>
					<Text className='text-sm text-gray-600'>{t('signInVariant.noAccountYet')}</Text>
					<View onClick={goToSignUp}>
						<Text className='text-sm font-bold text-black underline'>{t('signInVariant.registerNow')}</Text>
					</View>
				</View>
			</View>

			<HelpSection
				className='mt-14'
				hideTopDivisor
				showItemDivisors
			/>

			<BottomInset />

			<Alert
				show={showLoginErrorAlert}
				message={t('signInVariant.socialLoginError')}
				onDismiss={() => setShowLoginErrorAlert(false)}
			/>
		</Page>
	)
}
