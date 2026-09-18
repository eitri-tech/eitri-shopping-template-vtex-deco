import { useEffect, useState } from 'react'
import Eitri from 'eitri-bifrost'
import { useLocalShoppingCart } from '../providers/LocalCart'
import { HeaderContentWrapper, HeaderReturn, HeaderText, Loading, TrackingService } from 'eitri-shopping-template-vtex-deco-shared'
import { saveCartIdOnStorage } from '../services/cartService'
import Freight from '../components/Freight/Freight'
import Coupon from '../components/Coupon/Coupon'
import SellerCode from '../components/SellerCode/SellerCode'
import CartSummary from '../components/CartSummary/CartSummary'
import CartItemsContent from '../components/CartItemsContent/CartItemsContent'
import ActionButton from '../components/ActionButton/ActionButton'
import { startConfigure } from '../services/AppService'
import { Page, View } from 'eitri-luminus'
import { useTranslation } from 'eitri-i18n'
import MinimumOrderValue from '../components/MinimumOrderValue/MinimumOrderValue'

export default function Home() {
	const { t } = useTranslation()
	const { cart, startCart } = useLocalShoppingCart()

	const [appIsLoading, setAppIsLoading] = useState(true)
	const [openWithBottomBar, setOpenWithBottomBar] = useState<boolean | null>(null)

	useEffect(() => {
		startHome()
		Eitri.navigation.setOnResumeListener(() => {
			startHome()
		})
	}, [])

	useEffect(() => {
		if (!appIsLoading && openWithBottomBar !== null && cart?.items?.length === 0) {
			Eitri.navigation.navigate({
				path: 'EmptyCart',
				state: { openWithBottomBar },
				replace: true
			})
		}
	}, [cart, appIsLoading, openWithBottomBar])

	const startHome = async () => {
		const startParams = (await Eitri.getInitializationInfos()) as { tabIndex?: number | string; orderFormId?: string }
		// tabIndex 2 is the "Sacola" bottom tab (see app-config.yaml bottom-tab-view-simulation)
		setOpenWithBottomBar(String(startParams?.tabIndex) === '2')

		await startConfigure()
		const cart = await loadCart()

		setAppIsLoading(false)
		TrackingService.sendScreenView('Carrinho', 'HomeCart')
		if (cart) {
			TrackingService.viewCartEvent(cart)
		}
	}

	const loadCart = async () => {
		const startParams = (await Eitri.getInitializationInfos()) as { orderFormId?: string }
		if (startParams?.orderFormId) {
			await saveCartIdOnStorage(startParams.orderFormId)
		}
		return startCart?.()
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

						<SellerCode />

						<CartSummary />
					</View>

					<ActionButton />
				</>
			)}
		</Page>
	)
}
