import { useEffect, useState } from 'react'
import { Page, View, Text, Image, Toggle } from 'eitri-luminus'
import Eitri from 'eitri-bifrost'
import {
	CustomButton,
	Divisor,
	HeaderText,
	HeaderLogo,
	HeaderContentWrapper,
	BottomInset,
	Loading,
	UserIcon,
	HeartIcon,
	PackageIcon,
	LogOutIcon,
	BellIcon,
	MapPinIcon,
	ArrowRightIcon,
	resetBiometricLoginAttempt
} from 'eitri-shopping-template-vtex-deco-shared'
import { doLogout, getCustomerData, isLoggedIn, removeClientData } from '../services/CustomerService'
import { navigate, PAGES } from '../services/NavigationService'
import { sendScreenView } from '../services/TrackingService'
import { loadBonusScreenData, invalidateBonusCache } from '../services/BonusService'
import { useTranslation } from 'eitri-i18n'
import ProfileCardButton from '../components/ProfileCardButton/ProfileCardButton'
import { startConfigure } from '../services/AppService'
import HelpSection from '../components/HelpSection/HelpSection'
import bonusIcon from '../assets/images/bonus.png'
import type { VtexCustomerProfile } from '../types/vtex'

// TODO: configurar URLs via Remote Config ou AppService
const TERMS_URL = 'https://montecarlojoias.zendesk.com/hc/pt-br/articles/360043776251-Termos-de-uso'
const PRIVACY_URL = 'https://montecarlojoias.zendesk.com/hc/pt-br/articles/360043337712-Politica-de-Privacidade'

interface InitializationInfos {
	action?: string
	route?: string
	[key: string]: unknown
}

interface InitOptions {
	isAppOpen?: boolean
}

export default function Home() {
	const PAGE = 'Minha conta'

	const { t } = useTranslation()

	const [isLoading, setIsLoading] = useState(true)
	const [customerData, setCustomerData] = useState<VtexCustomerProfile>({})
	const [isLogged, setIsLogged] = useState<boolean | null>(null)
	const [bonusBalance, setBonusBalance] = useState<number | null>(null)
	const [notificationsEnabled, setNotificationsEnabled] = useState(false)
	const [locationEnabled, setLocationEnabled] = useState(false)

	useEffect(() => {
		// Only this first, direct call is a genuine app open — the resume
		// listener below re-fires `init()` on every tab switch back into this
		// app, which must NOT re-invalidate an otherwise-still-fresh bonus cache.
		init({ isAppOpen: true })
		sendScreenView('Perfil', 'HomeAccount')
		Eitri.navigation.setOnResumeListener(() => {
			init({ isAppOpen: false })
		})
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const init = async (options: InitOptions = {}) => {
		const { isAppOpen = false } = options
		await startConfigure()
		await syncPermissionStates()

		const startParams = (await Eitri.getInitializationInfos()) as InitializationInfos | undefined

		if (startParams?.action === 'RequestLogin') {
			navigate(PAGES.AUTH_SELECT, { closeAppAfterLogin: true }, true)
			return
		}

		if (startParams) {
			const openRoute = processDeepLink(startParams)
			if (openRoute) {
				Eitri.navigation.navigate(openRoute)
				return
			}
		}

		const logged = await isLoggedIn()

		if (logged) {
			if (isAppOpen) await invalidateBonusCache()
			await loadMe()
		} else {
			doLogout()
		}

		setIsLogged(logged)
		setIsLoading(false)

		sendScreenView('Minha conta', 'HomeAccount')
	}

	const loadMe = async () => {
		const data = (await getCustomerData()) as VtexCustomerProfile | undefined
		if (!data) {
			return
		}
		setCustomerData(data)
		loadBonusBalance(data)
	}

	// Also warms the Bonus screen's cache (statement + expiration, not just this
	// balance) as a side effect — so a subsequent visit to the Bonus screen can
	// render instantly instead of re-running the whole auth+profile+extract
	// pipeline. See BonusService.loadBonusScreenData/peekCachedBonusScreenData.
	const loadBonusBalance = async (customer: VtexCustomerProfile) => {
		try {
			// BonusService is still untyped JS — cast the shape this screen actually reads.
			const result = (await loadBonusScreenData(customer)) as { balance?: number } | undefined
			setBonusBalance(result?.balance ?? null)
		} catch (e) {
			setBonusBalance(null)
		}
	}

	const _doLogout = async () => {
		setIsLoading(true)
		resetBiometricLoginAttempt()
		await doLogout()
		await removeClientData()
		init()
	}

	const processDeepLink = (startParams: InitializationInfos) => {
		if (startParams?.route) {
			const { route, ...rest } = startParams
			return {
				path: route,
				state: rest,
				replace: true
			}
		}
	}

	const isPermissionGranted = (permission?: { status?: string }) =>
		permission?.status === 'GRANTED' || permission?.status === 'LIMITED'

	const syncNotificationPermission = async () => {
		try {
			const permission = await Eitri.notification.checkPermission()
			setNotificationsEnabled(isPermissionGranted(permission))
		} catch (error) {
			setNotificationsEnabled(false)
			console.error('Erro ao verificar permissão de notificação', error)
		}
	}

	const syncLocationPermission = async () => {
		try {
			const permission = await Eitri.geolocation.checkPermission({ precision: 'precise' })
			setLocationEnabled(isPermissionGranted(permission))
		} catch (error) {
			setLocationEnabled(false)
			console.error('Erro ao verificar permissão de localização', error)
		}
	}

	const syncPermissionStates = async () => {
		await Promise.all([syncNotificationPermission(), syncLocationPermission()])
	}

	const handleNotificationsToggle = async () => {
		try {
			const permission = await Eitri.notification.checkPermission()

			if (isPermissionGranted(permission)) {
				await Eitri.system.openAppSettings()
				return
			}

			if (permission?.status === 'DENIED') {
				const requestedPermission = await Eitri.notification.requestPermission()
				setNotificationsEnabled(isPermissionGranted(requestedPermission))
				if (!isPermissionGranted(requestedPermission)) {
					await Eitri.system.openAppSettings()
				}
				return
			}

			await Eitri.system.openAppSettings()
		} catch (error) {
			console.error('Erro ao alterar permissão de notificação', error)
		}
	}

	const handleLocationToggle = async () => {
		try {
			if (locationEnabled) {
				await Eitri.system.openAppSettings()
				return
			}

			const foregroundPermission = await Eitri.geolocation.requestPermission({ precision: 'precise' })
			const foregroundEnabled = isPermissionGranted(foregroundPermission)
			setLocationEnabled(foregroundEnabled)

			if (!foregroundEnabled) {
				await Eitri.system.openAppSettings()
				return
			}

			const modules = (await Eitri.modules()) as { geolocation?: { upgradeToBackgroundPermission?: () => Promise<unknown> } } | undefined
			if (modules?.geolocation?.upgradeToBackgroundPermission) {
				await Eitri.geolocation.upgradeToBackgroundPermission()
			}
		} catch (error) {
			console.error('Erro ao alterar permissão de localização', error)
		}
	}

	const openExternalLink = (url: string) => {
		Eitri.openBrowser({ url })
	}

	const formatCurrency = (value?: number | null) =>
		value?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

	return (
		<Page title={PAGE}>
			<HeaderContentWrapper
				className='items-center'
				containerClassName={isLogged ? 'shadow-none' : ''}>
				{isLogged === false ? (
					<View className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center'>
						<HeaderLogo />
					</View>
				) : (
					<View className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center'>
						<Text className='text-header-content text-2xl font-medium line-clamp-1'>
							{t('home.labelMyAccount')}
						</Text>
					</View>
				)}
			</HeaderContentWrapper>

			<Loading
				fullScreen
				isLoading={isLoading}
			/>

			{!isLoading && !isLogged && (
				<View className='flex flex-col'>
					<View className='px-4 pt-6 pb-4 flex flex-col items-center gap-2'>
						<Text className='text-2xl font-bold text-gray-900'>{t('home.labelMyAccount')}</Text>
						<Text className='text-gray-600 text-center leading-relaxed'>{t('home.labelLoginDesc')}</Text>
						<Text className='text-gray-600 text-center font-medium'>{t('home.labelPromoText')}</Text>
					</View>

					<View className='px-4 flex flex-col gap-3 mb-4'>
						<CustomButton
							label={t('home.labelEntrar')}
							onPress={() => navigate(PAGES.AUTH_SELECT)}
						/>
						<CustomButton
							variant='outlined'
							label={t('home.labelCadastrar')}
							onPress={() => navigate(PAGES.SIGNUP)}
						/>
					</View>

					<View className='flex flex-col'>
						<ProfileCardButton
							label={t('home.labelBonus')}
							icon={
								<Image
									src={bonusIcon}
									width='24px'
									height='24px'
								/>
							}
							onClick={() => navigate(PAGES.BONUS)}
						/>
						<View className='px-4'>
							<Divisor />
						</View>
						<ProfileCardButton
							label={t('home.labelMyFavorites')}
							icon={
								<HeartIcon
									size={24}
									strokeWidth={1.5}
									className='text-gray-700'
								/>
							}
							onClick={() => navigate(PAGES.AUTH_SELECT, { redirectTo: PAGES.WISH_LIST })}
						/>
						<View className='px-4'>
							<Divisor />
						</View>
					</View>

					<View className='flex flex-col'>
						<View className='flex flex-row justify-between items-center px-4 py-4'>
							<View className='flex flex-row items-center gap-3'>
								<BellIcon
									size={24}
									strokeWidth={1.5}
									className='text-gray-700'
								/>
								<Text className='text-gray-700 font-medium'>{t('home.labelNotifications')}</Text>
							</View>
							<Toggle
								checked={notificationsEnabled}
								onChange={handleNotificationsToggle}
							/>
						</View>
						<View className='px-4'>
							<Divisor />
						</View>
						<View className='flex flex-row justify-between items-center px-4 py-4'>
							<View className='flex flex-row items-center gap-3'>
								<MapPinIcon
									size={24}
									strokeWidth={1.5}
									className='text-gray-700'
								/>
								<Text className='text-gray-700 font-medium'>{t('home.labelLocation')}</Text>
							</View>
							<Toggle
								checked={locationEnabled}
								onChange={handleLocationToggle}
							/>
						</View>
						<View className='px-4'>
							<Divisor />
						</View>
					</View>

					<HelpSection />
				</View>
			)}

			{!isLoading && isLogged && (
				<View className='flex flex-col'>
					<View className='px-4 pt-0 pb-4 flex justify-center w-full'>
						<Text className='text-gray-900 text-base text-center'>
							{customerData?.firstName?.trim()
								? t('home.greeting', { name: customerData.firstName.trim() })
								: t('home.labelHello')}
						</Text>
					</View>

					<View className='flex flex-col mt-2'>
						<ProfileCardButton
							label={t('home.labelPersonalData')}
							icon={
								<UserIcon
									size={24}
									strokeWidth={1.5}
									className='text-gray-700'
								/>
							}
							onClick={() => navigate(PAGES.EDIT_PROFILE, { customerData })}
						/>
						<View className='px-4'>
							<Divisor />
						</View>
						<ProfileCardButton
							label={t('home.labelMyFavorites')}
							icon={
								<HeartIcon
									size={24}
									strokeWidth={1.5}
									className='text-gray-700'
								/>
							}
							onClick={() => navigate(PAGES.WISH_LIST)}
						/>
						<View className='px-4'>
							<Divisor />
						</View>
						<ProfileCardButton
							label={t('home.labelMyOrders')}
							icon={
								<PackageIcon
									size={24}
									strokeWidth={1.5}
									className='text-gray-700'
								/>
							}
							onClick={() => navigate(PAGES.ORDER_LIST)}
						/>
						<View className='px-4'>
							<Divisor />
						</View>
						<View
							className='flex flex-col px-4 py-4 w-full'
							onClick={() => navigate(PAGES.BONUS)}>
							<View className='flex flex-row justify-between items-center w-full'>
								<View className='flex flex-row items-center gap-2'>
									<Image
										src={bonusIcon}
										width='24px'
										height='24px'
									/>
									<Text className='text-gray-700 font-medium'>{t('home.labelMyBonus')}</Text>
								</View>
								<ArrowRightIcon
									size={16}
									className='text-gray-700'
								/>
							</View>
							{bonusBalance !== null && (
								<View className='ml-8 mt-2 bg-gray-100 px-3 py-2 flex flex-col items-start'>
									<Text className='text-xs text-gray-500'>{t('home.labelAvailableBalance')}:</Text>
									<Text className='text-sm font-bold text-gray-900'>{formatCurrency(bonusBalance)}</Text>
								</View>
							)}
						</View>
					</View>

					<View className='px-4 py-2'>
						<View
							className='flex flex-row items-center gap-2 py-2'
							onClick={_doLogout}>
							<LogOutIcon
								size={20}
								strokeWidth={1.5}
								className='text-red-500'
							/>
							<Text className='text-red-500 font-medium'>{t('home.labelLeave')}</Text>
						</View>
					</View>

					<View className='px-4'>
						<Divisor />
					</View>

					<HelpSection />

					<View className='px-4 py-6 flex flex-col items-start gap-2'>
						<View onClick={() => openExternalLink(TERMS_URL)}>
							<Text className='text-gray-500 text-sm underline'>{t('home.labelTermsConditions')}</Text>
						</View>
						<View onClick={() => openExternalLink(PRIVACY_URL)}>
							<Text className='text-gray-500 text-sm underline'>{t('home.labelPrivacyPolicy')}</Text>
						</View>
					</View>
				</View>
			)}

			<BottomInset />
		</Page>
	)
}
