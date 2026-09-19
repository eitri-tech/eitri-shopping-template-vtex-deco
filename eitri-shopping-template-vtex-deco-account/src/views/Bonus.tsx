import { useState, useEffect, useRef } from 'react'
import { Page, View, Text } from 'eitri-luminus'
import { HeaderContentWrapper, HeaderReturn, BottomInset, Loading } from 'eitri-shopping-template-vtex-deco-shared'
import { EventBus, EventBusChannels } from 'eitri-shopping-vtex-shared'
import { useTranslation } from 'eitri-i18n'
import { sendScreenView } from '../services/TrackingService'
import { getCustomerData, isLoggedIn } from '../services/CustomerService'
import { navigate, PAGES } from '../services/NavigationService'
import { formatPrice } from '../utils/utils'
import {
	BONUS_LINKS,
	STATEMENT_FILTER,
	filterStatement,
	loadBonusScreenData,
	peekCachedBonusScreenData,
	type BonusMovement,
	type BonusExpiration,
	type BonusScreenData,
	type StatementFilter,
	type BonusFaqItem
} from '../services/BonusService'
import BonusExpirationAlert from '../components/Bonus/BonusExpirationAlert'
import BonusFilters from '../components/Bonus/BonusFilters'
import BonusStatementItem from '../components/Bonus/BonusStatementItem'
import BonusFaq from '../components/Bonus/BonusFaq'
import BonusEmptyState from '../components/Bonus/BonusEmptyState'
import BonusErrorState from '../components/Bonus/BonusErrorState'
import BonusMissingCpfState from '../components/Bonus/BonusMissingCpfState'
import ProtectedView from '../components/ProtectedView/ProtectedView'
import Eitri from 'eitri-bifrost'
import type { RouteProps } from '../types/route'

interface BonusLocationState {
	tabIndex?: number
	[key: string]: unknown
}

interface BonusProps extends RouteProps<BonusLocationState> {
	[key: string]: unknown
}

export default function Bonus(props: BonusProps) {
	const { t } = useTranslation()
	const tabIndex = props?.location?.state?.tabIndex
	const openedFromBottomTab = tabIndex !== undefined && tabIndex !== null

	const [isLoading, setIsLoading] = useState(true)
	const [hasError, setHasError] = useState(false)
	const [missingCpf, setMissingCpf] = useState(false)
	const [balance, setBalance] = useState<number | null>(null)
	const [customerName, setCustomerName] = useState('')
	const [expiration, setExpiration] = useState<BonusExpiration | null>(null)
	const [movements, setMovements] = useState<BonusMovement[]>([])
	const [filter, setFilter] = useState<StatementFilter>(STATEMENT_FILTER.ALL)

	const authCheckId = useRef(0)
	const hasTrackedScreen = useRef(false)
	const isActive = useRef(true)
	// Tracks whether the screen already has something on it (from cache or a
	// finished fetch) — once true, checkAuth/load refresh silently in the
	// background instead of putting the full-screen spinner back up.
	const hasRenderedData = useRef(false)

	useEffect(() => {
		isActive.current = true
		hydrateFromCache()
		checkAuth()
		Eitri.navigation.setOnResumeListener(checkAuth)
		EventBus.subscribe({
			channel: EventBusChannels.USER_LOGGED_IN,
			broadcast: true,
			callback: checkAuth
		})
		EventBus.subscribe({
			channel: EventBusChannels.USER_LOGGED_OUT,
			broadcast: true,
			callback: redirectToLogin
		})

		return () => {
			isActive.current = false
			authCheckId.current += 1
		}
	}, [])

	// Instant, no-network render of whatever was cached by a previous visit or
	// by Home's preload — skips the spinner entirely when it hits. checkAuth
	// still runs right after (see the mount effect) to verify auth and
	// silently reconcile the data once the real customer is confirmed.
	const hydrateFromCache = async () => {
		const cached = await peekCachedBonusScreenData()
		if (!isActive.current || hasRenderedData.current || !cached) return

		applyScreenData(cached)
		hasRenderedData.current = true
		setIsLoading(false)
	}

	const applyScreenData = (data: BonusScreenData) => {
		setCustomerName(data.customerName || '')
		setMissingCpf(Boolean(data.missingCpf))
		setBalance(data.balance)
		setExpiration(data.expiration)
		setMovements(data.statement || [])
	}

	const checkAuth = async () => {
		if (!isActive.current) return

		const currentCheckId = ++authCheckId.current
		if (!hasRenderedData.current) setIsLoading(true)

		let logged = false
		try {
			logged = await isLoggedIn()
		} catch (error) {
			console.error('Erro ao verificar login para o Meu Bônus', error)
		}

		if (!isActive.current || currentCheckId !== authCheckId.current) return

		if (!logged) {
			setIsLoading(false)
			return
		}

		await loadData(currentCheckId)
	}

	const loadData = async (checkId: number) => {
		setHasError(false)
		try {
			const customer = await getCustomerData()
			if (!isActive.current || checkId !== authCheckId.current) return

			const data = await loadBonusScreenData(customer)
			if (!isActive.current || checkId !== authCheckId.current) return

			applyScreenData(data)
			hasRenderedData.current = true

			if (!hasTrackedScreen.current) {
				hasTrackedScreen.current = true
				sendScreenView('Meu Bônus', 'Bonus')
			}
		} catch (error) {
			console.error('Erro ao carregar dados do Meu Bônus', error)
			if (isActive.current && checkId === authCheckId.current) {
				setHasError(true)
			}
		} finally {
			if (isActive.current && checkId === authCheckId.current) {
				setIsLoading(false)
			}
		}
	}

	const redirectToLogin = () => {
		navigate(PAGES.SIGNIN, { redirectTo: PAGES.BONUS })
	}

	const handleRetry = () => {
		hasRenderedData.current = false
		checkAuth()
	}

	const openLink = (url: string, inApp = false) => {
		Eitri.openBrowser({ url, inApp })
	}

	const handleOpenWhatsapp = () => openLink(BONUS_LINKS.WHATSAPP, false)
	const handleOpenFaq = () => openLink(BONUS_LINKS.FAQ, true)
	const handleFaqSelect = (item: BonusFaqItem) => {
		if (item?.url) openLink(item.url, false)
	}

	const handlePrimaryEmptyCta = () => {
		Eitri.nativeNavigation.open({ slug: 'home' })
	}

	const handleSecondaryEmptyCta = () => openLink(BONUS_LINKS.HOW_IT_WORKS, true)

	const handleCompleteCpf = () => {
		navigate(PAGES.EDIT_PROFILE, { redirectTo: PAGES.BONUS })
	}

	const filteredMovements = filterStatement(movements, filter)
	const hasBonus = balance !== null && balance > 0
	const greeting = customerName ? `Olá, ${customerName}!` : 'Olá!'

	return (
		<ProtectedView afterLoginRedirectTo={PAGES.BONUS}>
			<Page
				title={t('bonusScreen.headerText')}
				topInset>
				<HeaderContentWrapper containerClassName='shadow-none'>
					{!openedFromBottomTab && <HeaderReturn />}
					<View className='absolute left-0 right-0 flex justify-center pointer-events-none'>
						<Text className='font-bold text-center text-[16px] text-gray-900'>{t('bonusScreen.headerText')}</Text>
					</View>
				</HeaderContentWrapper>

				<Loading
					fullScreen
					isLoading={isLoading}
				/>

				{!isLoading && hasError && <BonusErrorState onRetryPress={handleRetry} />}

				{!isLoading && !hasError && missingCpf && (
					<BonusMissingCpfState
						onPrimaryPress={handleCompleteCpf}
						onWhatsapp={handleOpenWhatsapp}
						onFaq={handleOpenFaq}
					/>
				)}

				{!isLoading && !hasError && !missingCpf && !hasBonus && (
					<BonusEmptyState
						onPrimaryPress={handlePrimaryEmptyCta}
						onSecondaryPress={handleSecondaryEmptyCta}
						onWhatsapp={handleOpenWhatsapp}
						onFaq={handleOpenFaq}
					/>
				)}

				{!isLoading && !hasError && !missingCpf && hasBonus && (
					<View className='flex flex-col pb-6'>
						{/* Balance card */}
						<View className='mx-4 mt-4 rounded-xl bg-black px-5 py-5 flex flex-col justify-between'>
							<View className='flex flex-col'>
								<Text className='text-[13px] text-gray-400'>{greeting}</Text>
								<Text className='text-[12px] text-gray-300 mt-1'>{t('bonusScreen.availableBalanceLabel')}</Text>
								<Text className='text-[28px] font-bold text-white tracking-tight mt-1'>
									{formatPrice(balance)}
								</Text>
							</View>
							<View className='mt-3 pt-3 border-t border-gray-800'>
								<Text className='text-[10px] text-gray-400 leading-snug'>{t('bonusScreen.balanceHelper')}</Text>
							</View>
						</View>

						{expiration && <BonusExpirationAlert expiration={expiration} />}

						{/* Statement */}
						<View className='mt-6'>
							<View className='px-4'>
								<Text className='text-[18px] font-bold text-gray-900'>{t('bonusScreen.statementTitle')}</Text>
							</View>

							<BonusFilters
								value={filter}
								onChange={setFilter}
							/>

							<View className='mt-2'>
								{filteredMovements.length === 0 ? (
									<View className='px-4 py-8 flex items-center justify-center'>
										<Text className='text-[13px] text-gray-500'>{t('bonusScreen.statementEmpty')}</Text>
									</View>
								) : (
									filteredMovements.map(movement => (
										<BonusStatementItem
											key={movement.id}
											movement={movement}
										/>
									))
								)}
							</View>
						</View>

						<BonusFaq onSelect={handleFaqSelect} />
					</View>
				)}

				<BottomInset />
			</Page>
		</ProtectedView>
	)
}
