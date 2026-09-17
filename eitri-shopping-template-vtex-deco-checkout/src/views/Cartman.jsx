import { Vtex } from 'eitri-shopping-vtex-shared'
import Eitri from 'eitri-bifrost'

export default function Cartman() {
	const [cart, setCart] = useState()

	useEffect(() => {
		getCart()
	}, [])

	const getCart = async () => {
		try {
			const cart = await Vtex.cart.getCartIfExists()
			setCart(cart)
		} catch (error) {
			console.log('Erro ao buscar cesta', error)
		}
	}

	const generateNewCart = async () => {
		const cart = await Vtex.cart.generateNewCart()
		setCart(cart)
	}

	const addRandomItem = async () => {
		try {
			const products = await Vtex.catalog.legacyParamsSearch('fq=P:%5B0%2520TO%252099999%5D&_from=0&_to=49')
			const product = products[Math.floor(Math.random() * products.length)]
			const sku = product.items[0]
			const result = await Vtex.cart.addItem(sku)
			setCart(result)
		} catch (e) {
			console.log('e', e)
		}
	}

	const goToHome = async () => {
		Eitri.navigation.navigate({ path: 'Home', replace: true })
	}

	const clearCart = async () => {
		await Vtex.cart.clearCart()
	}

	const userLogout = async () => {
		await Vtex.customer.logout()
	}

	return (
		<Page
			bottomInset
			topInset>
			<View
				className='p-4 flex flex-col gap-4'
				bottomInset
				topInset>
				<Text>{`Id da cesta: ${cart?.orderFormId}`}</Text>
				{cart?.items?.map(item => (
					<Text>{`Item na cesta: ${item?.name}`}</Text>
				))}
				<Button
					className='btn-primary w-full'
					onClick={generateNewCart}>
					Nova cesta
				</Button>
				<Button
					className='btn-primary w-full'
					onClick={addRandomItem}>
					Adicionar item aleatório
				</Button>
				<Button
					className='btn-primary w-full'
					onClick={clearCart}>
					Limpar cesta
				</Button>
				<Button
					className='btn-primary w-full'
					onClick={goToHome}>
					Ir pra Home
				</Button>
				<Button
					className='btn-primary w-full'
					onClick={userLogout}>
					Logout Usuário
				</Button>
			</View>
		</Page>
	)
}
