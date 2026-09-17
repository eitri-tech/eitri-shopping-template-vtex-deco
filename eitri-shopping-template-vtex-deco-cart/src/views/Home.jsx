import Eitri from 'eitri-bifrost'
import { useLocalShoppingCart } from '../providers/LocalCart'
import { HeaderContentWrapper, HeaderReturn, HeaderText, Loading, TrackingService } from 'eitri-shopping-template-vtex-deco-shared'
import { saveCartIdOnStorage } from '../services/cartService'
import Freight from '../components/Freight/Freight'
import Coupon from '../components/Coupon/Coupon'
import CartSummary from '../components/CartSummary/CartSummary'
import CartItemsContent from '../components/CartItemsContent/CartItemsContent'
import ActionButton from '../components/ActionButton/ActionButton'
import { startConfigure } from '../services/AppService'
import { Page } from 'eitri-luminus'
import { useTranslation } from 'eitri-i18n'
import MinimumOrderValue from '../components/MinimumOrderValue/MinimumOrderValue'

export default function Home(props) {
	const { t } = useTranslation()
	const { cart, startCart } = useLocalShoppingCart()

	const [appIsLoading, setAppIsLoading] = useState(true)
	const [openWithBottomBar, setOpenWithBottomBar] = useState(false)

	useEffect(() => {
		startHome()
		Eitri.navigation.setOnResumeListener(() => {
			startHome()
		})
	}, [])

	useEffect(() => {
		if (cart && cart.items.length === 0) {
			Eitri.navigation.navigate({
				path: 'EmptyCart',
				state: { openWithBottomBar },
				replace: true
			})
		}
	}, [cart])

	const startHome = async () => {
		const startParams = await Eitri.getInitializationInfos()
		setOpenWithBottomBar(startParams?.tabIndex)

		await startConfigure()
		const cart = await loadCart()

		setAppIsLoading(false)
		TrackingService.sendScreenView('Carrinho', 'HomeCart')
		TrackingService.viewCartEvent(cart)
	}

	const loadCart = async () => {
		const startParams = await Eitri.getInitializationInfos()
		if (startParams?.orderFormId) {
			await saveCartIdOnStorage(startParams?.orderFormId)
		}
		return startCart()
	}

	return (
		<Page title='Carrinho'>
			<HeaderContentWrapper>
				{!openWithBottomBar && <HeaderReturn />}
				<HeaderText text={t('home.title')} />
			</HeaderContentWrapper>

			<Loading
				fullScreen
				isLoading={appIsLoading}
			/>

			{cart && (
				<>
					<View className='py-4 flex flex-col gap-4'>
						<MinimumOrderValue />

						<CartItemsContent />

						<Freight />

						<Coupon />

						<CartSummary />
					</View>

					<ActionButton />
				</>
			)}
		</Page>
	)
}
