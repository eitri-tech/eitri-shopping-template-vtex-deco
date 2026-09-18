import { useEffect, useRef } from 'react'
import { Page } from 'eitri-luminus'
import Eitri from 'eitri-bifrost'
import { addLoggedCustomerToCart, cartHasCustomerData, saveCartIdOnStorage } from '../services/cartService'
import type { LoggedCustomer } from '../services/cartService'
import { startConfigure } from '../services/AppService'
import { useCustomer } from '../providers/Customer'
import { useLocalShoppingCart } from '../providers/LocalCart'
import { navigate } from '../services/navigationService'
import { TrackingService, Loading } from 'eitri-shopping-template-vtex-deco-shared'
import type { VtexCart } from '../types/vtex'

export default function Home() {
	const { startCart, addPersonalData } = useLocalShoppingCart()
	const { getCustomer, getUserByEmail } = useCustomer()
	const pristineRef = useRef(true)

	useEffect(() => {
		init()
	}, [])

	const init = async () => {
		try {
			await startConfigure()

			const [loggedCustomer, cart] = await Promise.all([
				getCustomer
					? (getCustomer().catch(err => {
							console.error('Failed to get customer:', err)
							return null
						}) as Promise<LoggedCustomer | null>)
					: Promise.resolve(null),
				loadCart().catch(err => {
					console.error('Failed to load cart:', err)
					throw err
				})
			])

			let _cart = cart

			if (loggedCustomer && cart) {
				const cartEmail = cart.clientProfileData?.email
				const customerEmail = loggedCustomer.email
				if (cartEmail !== customerEmail && addPersonalData) {
					try {
						const updated = await addLoggedCustomerToCart(loggedCustomer, cart, { addPersonalData })
						if (updated) _cart = updated as VtexCart
					} catch (e) {
						console.error('Failed to add customer to cart:', e)
					}
				}
			}

			loadCheckoutProfile(_cart?.clientProfileData?.email)
			handleNavigation(_cart)
		} catch (e) {
			console.log('Error ao buscar carrinho', e)
		}
	}

	const loadCart = async (): Promise<VtexCart | undefined> => {
		const startParams = (await Eitri.getInitializationInfos()) as { orderFormId?: string } | undefined

		if (startParams?.orderFormId) {
			await saveCartIdOnStorage(startParams.orderFormId)
		}

		return startCart?.()
	}

	const handleNavigation = async (cart?: VtexCart) => {
		if (!cart || cart.items.length === 0) {
			navigate('EmptyCart')
			return
		}

		if (pristineRef.current) {
			TrackingService.beginCheckoutEvent(cart)
			pristineRef.current = false
		}

		const destination = cartHasCustomerData(cart) ? 'FreightResolver' : 'PersonalData'

		navigate(destination, {}, true)
	}

	const loadCheckoutProfile = async (email?: string) => {
		if (!email) return
		await getUserByEmail?.(email)
	}

	return (
		<Page title='Checkout'>
			<Loading
				fullScreen
				isLoading={true}
			/>
		</Page>
	)
}
