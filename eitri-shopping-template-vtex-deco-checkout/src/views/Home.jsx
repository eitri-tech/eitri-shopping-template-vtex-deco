import Eitri from 'eitri-bifrost'
import { addLoggedCustomerToCart, cartHasCustomerData, saveCartIdOnStorage } from '../services/cartService'
import { startConfigure } from '../services/AppService'
import { useCustomer } from '../providers/Customer'
import { useLocalShoppingCart } from '../providers/LocalCart'
import { navigate } from '../services/navigationService'
import { TrackingService, Loading } from 'eitri-shopping-template-vtex-deco-shared'

export default function Home(props) {
	const { startCart, addPersonalData } = useLocalShoppingCart()
	const { getCustomer, getUserByEmail } = useCustomer()
	const pristineRef = useRef(true)

	useEffect(() => {
		init()
	}, [])

	const init = async () => {
		try {
			await startConfigure()

			// Carregar customer e cart em paralelo
			const [loggedCustomer, cart] = await Promise.all([
				getCustomer().catch(err => {
					console.error('Failed to get customer:', err)
					return null
				}),
				loadCart().catch(err => {
					console.error('Failed to load cart:', err)
					throw err // Cart é crítico
				})
			])

			let _cart = cart

			if (loggedCustomer) {
				const cartEmail = cart?.clientProfileData?.email
				const customerEmail = loggedCustomer?.email
				if (cartEmail !== customerEmail) {
					try {
						_cart = await addLoggedCustomerToCart(loggedCustomer, cart, { addPersonalData })
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

	const loadCart = async () => {
		const startParams = await Eitri.getInitializationInfos()

		if (startParams?.orderFormId) {
			await saveCartIdOnStorage(startParams?.orderFormId)
		}

		return await startCart()
	}

	const handleNavigation = async cart => {
		// navigate('CheckoutReview')
		// return
		// console.log('cart=====>', cart?.orderFormId)

		if (!cart || cart.items.length === 0) {
			return navigate('EmptyCart')
		}

		if (pristineRef.current) {
			TrackingService.beginCheckoutEvent(cart)
			pristineRef.current = false
		}

		const destination = cartHasCustomerData(cart) ? 'FreightResolver' : 'PersonalData'

		return navigate(destination, {}, true)
	}

	const loadCheckoutProfile = async email => {
		if (!email) return
		await getUserByEmail(email)
	}

	return (
		<Page title={'Checkout'}>
			<Loading
				fullScreen={true}
				isLoading={true}
			/>
		</Page>
	)
}
