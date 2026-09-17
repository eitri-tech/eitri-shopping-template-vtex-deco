import { Page, View, Text } from 'eitri-luminus'
import { HeaderContentWrapper, HeaderReturn, BottomInset, Loading } from 'eitri-shopping-monte-carlo-shared'
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
	peekCachedBonusScreenData
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

export default function Bonus(props) {
	const { t } = useTranslation()
	const tabIndex = props?.location?.state?.tabIndex
	const openedFromBottomTab = tabIndex !== undefined && tabIndex !== null

	const [isLoading, setIsLoading] = useState(true)
	const [hasError, setHasError] = useState(false)
	const [missingCpf, setMissingCpf] = useState(false)
	const [balance, setBalance] = useState(null)
	const [customerName, setCustomerName] = useState('')
	const [expiration, setExpiration] = useState(null)
	const [movements, setMovements] = useState([])
	const [filter, setFilter] = useState(STATEMENT_FILTER.ALL)

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

	const applyScreenData = data => {
		setCustomerName(data.customerName || '')
		setMissingCpf(!!data.missingCpf)
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
			console.error('Erro ao sincronizar autenticação na tela de bônus', error)
		}

		if (!isActive.current || currentCheckId !== authCheckId.current) return

		if (!logged) {
			navigate(
				PAGES.AUTH_SELECT,
				{
					redirectTo: PAGES.BONUS,
					redirectState: openedFromBottomTab ? { tabIndex } : undefined
				},
				true
			)
			return
		}

		if (!hasTrackedScreen.current) {
			hasTrackedScreen.current = true
			sendScreenView('MeuBonus', 'BonusScreen')
		}

		await load(currentCheckId)
	}

	const load = async currentCheckId => {
		try {
			// getCustomerData/loadBonusScreenData below are the same auth-verified
			// pipeline as before — the CPF check inside loadBonusScreenData covers
			// the "gateway requires a CPF" case (see BonusExtractService), which
			// otherwise fails with a generic BAD_REQUEST indistinguishable from a
			// real outage.
			const customer = await getCustomerData()
			if (!isActive.current || currentCheckId !== authCheckId.current) return

			const data = await loadBonusScreenData(customer)
			if (!isActive.current || currentCheckId !== authCheckId.current) return

			applyScreenData(data)
			hasRenderedData.current = true
			setHasError(false)
		} catch (e) {
			console.error('[Bonus] load failed', e)
			// Only surface the error state when there's nothing already on screen
			// to show instead — a background refresh failing shouldn't blank out
			// a still-good cached view.
			if (isActive.current && currentCheckId === authCheckId.current && !hasRenderedData.current) {
				setHasError(true)
			}
		} finally {
			if (isActive.current && currentCheckId === authCheckId.current) {
				setIsLoading(false)
			}
		}
	}

	const redirectToLogin = () => {
		if (!isActive.current) return

		authCheckId.current += 1
		setIsLoading(true)
		navigate(PAGES.AUTH_SELECT, { redirectTo: PAGES.BONUS }, true)
	}

	const openLink = url => {
		Eitri.openBrowser({ url })
	}
	
	const goToHome = async () => {
		await Eitri.bottomBar.changeTab({ index: 0 })
		await Eitri.navigation.close({ resetStack: true })
	}

	const hasBalance = typeof balance === 'number' && balance > 0
	const visibleMovements = filterStatement(movements, filter)

	return (
		<ProtectedView afterLoginRedirectTo={'Bonus'}>
			<Page
				title={t('bonusScreen.title')}
				topInset>
				<HeaderContentWrapper>
					{!openedFromBottomTab && <HeaderReturn onClick={() => navigate(PAGES.HOME, {}, true)} />}

					<View className='absolute left-0 right-0 flex flex-col items-center pointer-events-none'>
						<Text className='text-[19px] font-bold text-header-content leading-tight'>
							{t('bonusScreen.title')}
						</Text>
						{customerName && (
							<Text className='text-[13px] text-gray-600 mt-[2px]'>
								{t('bonusScreen.greeting', { name: customerName })}
							</Text>
						)}
					</View>
				</HeaderContentWrapper>

				<Loading
					fullScreen
					isLoading={isLoading}
				/>

				{!isLoading && hasError && <BonusErrorState onRetryPress={checkAuth} />}

				{!isLoading && !hasError && missingCpf && (
					<BonusMissingCpfState
						onPrimaryPress={() => navigate(PAGES.EDIT_PROFILE)}
						onWhatsapp={() => openLink(BONUS_LINKS.WHATSAPP)}
						onFaq={() => openLink(BONUS_LINKS.FAQ)}
					/>
				)}

				{!isLoading && !hasError && !missingCpf && hasBalance && (
					<View className='flex flex-col pb-6'>
						<View className='flex flex-col items-center pt-5'>
							<Text className='text-[13px] text-gray-600'>{t('bonusScreen.availableBalance')}</Text>
							<Text className='text-[32px] font-bold text-gray-900 leading-tight mt-1'>
								{formatPrice(balance)}
							</Text>
						</View>

						<BonusExpirationAlert expiration={expiration} />

						<View className='flex flex-col px-4 mt-6'>
							<Text className='text-[18px] font-bold text-gray-900'>{t('bonusScreen.statementTitle')}</Text>
							<Text className='text-[12px] text-gray-500 mt-[2px]'>
								{t('bonusScreen.statementSubtitle')}
							</Text>
						</View>

						<BonusFilters
							value={filter}
							onChange={setFilter}
						/>

						<View className='mt-1'>
							{visibleMovements.length === 0 ? (
								<View className='px-4 py-8 flex items-center'>
									<Text className='text-[12px] text-gray-500'>{t('bonusScreen.emptyStatement')}</Text>
								</View>
							) : (
								visibleMovements.map(movement => (
									<BonusStatementItem
										key={movement.id}
										movement={movement}
									/>
								))
							)}
						</View>

						<BonusFaq onSelect={item => openLink(item.url || BONUS_LINKS.FAQ)} />
					</View>
				)}

				{!isLoading && !hasError && !missingCpf && !hasBalance && (
					<BonusEmptyState
						onPrimaryPress={goToHome}
						onSecondaryPress={() => openLink(BONUS_LINKS.HOW_IT_WORKS)}
						onWhatsapp={() => openLink(BONUS_LINKS.WHATSAPP)}
						onFaq={() => openLink(BONUS_LINKS.FAQ)}
					/>
				)}

				<BottomInset />
			</Page>
		</ProtectedView>
	)
}
