import { useEffect, useState } from 'react'
import { Page, View, Text, Image } from 'eitri-luminus'
import Eitri from 'eitri-bifrost'
import { RemoteConfig } from 'eitri-shopping-vtex-shared'
import { CustomButton, HeaderText, HeaderContentWrapper, BottomInset, Loading } from 'eitri-shopping-template-vtex-deco-shared'
import { FiUser, FiHeart, FiMapPin, FiPackage, FiLock, FiCreditCard, FiRepeat } from 'react-icons/fi'
import { doLogout, getCustomerData, isLoggedIn, removeClientData } from '../services/CustomerService'
import { navigate, PAGES } from '../services/NavigationService'
import { sendScreenView } from '../services/TrackingService'
import { useTranslation } from 'eitri-i18n'
import ProfileCardButton from '../components/ProfileCardButton/ProfileCardButton'
import { startConfigure } from '../services/AppService'
import PoweredBy from '../components/PoweredBy/PoweredBy'
import LoginCard from '../components/LoginCard/LoginCard'
import InfoCard from '../components/InfoCard/InfoCard'
import logoBrazilianEngineering from '../assets/images/BrazilianEngineering-Logo.png'
import AppVersion from '../components/AppVersion/AppVersion'
import type { VtexCustomerProfile } from '../types/vtex'

interface InitializationInfos {
	action?: string
	route?: string
	[key: string]: unknown
}

export default function Home() {
	const PAGE = 'Minha conta'

	const { t } = useTranslation()

	const [isLoading, setIsLoading] = useState(true)
	const [customerData, setCustomerData] = useState<VtexCustomerProfile>({})
	const [isLogged, setIsLogged] = useState<boolean | null>(null)

	const subscriptionConfig = RemoteConfig.getContent('appConfigs.pdp.subscription')

	useEffect(() => {
		init()
		sendScreenView('Perfil', 'HomeAccount')
		Eitri.navigation.setOnResumeListener(() => {
			init()
		})
	}, [])

	const init = async () => {
		await startConfigure()

		const startParams = (await Eitri.getInitializationInfos()) as InitializationInfos | undefined

		if (startParams?.action === 'RequestLogin') {
			navigate(PAGES.SIGNIN, { closeAppAfterLogin: true }, true)
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
			await loadMe()
		} else {
			doLogout()
		}

		setIsLogged(logged)
		setIsLoading(false)

		sendScreenView('Minha conta', 'HomeAccount')
	}

	const loadMe = async () => {
		const data = await getCustomerData()
		if (!data) {
			return
		}
		setCustomerData(data)
	}

	const _doLogout = async () => {
		setIsLoading(true)
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

	return (
		<Page title={PAGE}>
			<HeaderContentWrapper className='justify-between'>
				<HeaderText text={t('home.labelMyAccount')} />
			</HeaderContentWrapper>

			<Loading
				fullScreen
				isLoading={isLoading}
			/>

			{!isLoading && (isLogged ? <InfoCard customerData={customerData} /> : <LoginCard />)}

			<View className='px-4 mt-2 mb-2'>
				<Text className='font-bold text-xl mb-3 text-gray-900'>{t('home.lbPersonalData')}</Text>

				<View className='flex flex-col gap-3 mt-2'>
					<ProfileCardButton
						label={t('home.labelMyAccount')}
						icon={
							<FiUser
								size={24}
								className='text-gray-700'
							/>
						}
						onClick={() => {
							isLogged
								? navigate(PAGES.EDIT_PROFILE, { customerData })
								: navigate(PAGES.SIGNIN, { redirectTo: PAGES.EDIT_PROFILE })
						}}
					/>
					<ProfileCardButton
						label={t('home.labelMyFavorites')}
						icon={
							<FiHeart
								size={24}
								className='text-gray-700'
							/>
						}
						onClick={() => {
							isLogged
								? navigate(PAGES.WISH_LIST)
								: navigate(PAGES.SIGNIN, { redirectTo: PAGES.WISH_LIST })
						}}
					/>
					<ProfileCardButton
						label={t('home.labelAddresses', 'Endereços')}
						icon={
							<FiMapPin
								size={24}
								className='text-gray-700'
							/>
						}
						onClick={() => navigate(PAGES.ADDRESS_LIST)}
					/>
					{isLogged && (
						<ProfileCardButton
							label={t('home.labelChangePassword')}
							icon={
								<FiLock
									size={24}
									className='text-gray-700'
								/>
							}
							onClick={() =>
								navigate(PAGES.CHANGE_PASSWORD, {
									email: customerData.email,
									passwordLastUpdate: (customerData.passwordLastUpdate as string | null | undefined) ?? null
								})
							}
						/>
					)}
					{isLogged && (
						<ProfileCardButton
							label={t('home.labelSavedCards')}
							icon={
								<FiCreditCard
									size={24}
									className='text-gray-700'
								/>
							}
							onClick={() => navigate(PAGES.SAVED_CARDS)}
						/>
					)}
				</View>
			</View>

			<View className='px-4 mt-6 mb-2'>
				<Text className='font-bold text-xl mb-3 text-gray-900'>{t('home.lbOrders')}</Text>
				<View className='flex flex-col gap-3 mt-2'>
					<ProfileCardButton
						label={t('home.labelMyOrders')}
						icon={
							<FiPackage
								size={24}
								className='text-gray-700'
							/>
						}
						onClick={() => {
							isLogged
								? navigate(PAGES.ORDER_LIST)
								: navigate(PAGES.SIGNIN, { redirectTo: PAGES.ORDER_LIST })
						}}
					/>
					{subscriptionConfig && (
						<ProfileCardButton
							label={t('home.labelMySubscriptions', 'Minhas assinaturas')}
							icon={
								<FiRepeat
									size={24}
									className='text-gray-700'
								/>
							}
							onClick={() => navigate(PAGES.SUBSCRIPTIONS)}
						/>
					)}
				</View>
			</View>

			{isLogged && (
				<View className='px-4 py-6 mt-4'>
					<CustomButton
						variant='outlined'
						label={t('home.labelLeave')}
						onPress={_doLogout}
					/>
				</View>
			)}

			<View className='flex flex-col justify-center w-full items-center mt-6 pb-8'>
				<PoweredBy />
				<Image
					src={logoBrazilianEngineering}
					className={'w-[130px]'}
				/>
				<AppVersion />
			</View>

			<BottomInset />
		</Page>
	)
}
