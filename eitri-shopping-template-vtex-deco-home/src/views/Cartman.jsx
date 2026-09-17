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
			console.log('cart========>', cart.orderFormId)
			setCart(cart)
		} catch (error) {
			console.log('Erro ao buscar carrinho', error)
		}
	}

	const generateNewCart = async () => {
		const cart = await Vtex.cart.generateNewCart()
		setCart(cart)
	}

	const addRandomItem = async () => {
		const products = await Vtex.catalog.legacyParamsSearch('fq=P:%5B0%2520TO%252099999%5D&_from=0&_to=49')
		const product = products[Math.floor(Math.random() * products.length)]
		const sku = product.items[0]
		const result = await Vtex.cart.addItem(sku)
		setCart(result)
	}

	const goToHome = async () => {
		Eitri.navigation.navigate({ path: 'Home', replace: true })
		return
	}

	const clearCart = async () => {
		await Vtex.cart.clearCart()
		return
	}

	return (
		<Page
			bottomInset
			topInset>
			<View
				className='p-4 flex flex-col gap-4'
				bottomInset
				topInset>
				<Text className={'select-text'}>{`Id da cesta: ${cart?.orderFormId}`}</Text>
				{cart?.items?.map(item => (
					<Text>{`Item na cesta: ${item?.name}`}</Text>
				))}
				<Button
					className='btn-primary w-full'
					onClick={generateNewCart}>
					Novo carrinho
				</Button>
				<Button
					className='btn-primary w-full'
					onClick={addRandomItem}>
					Adicionar item aleatório
				</Button>
				<Button
					className='btn-primary w-full'
					onClick={clearCart}>
					Limpar carrinho
				</Button>
				<Button
					className='btn-primary w-full'
					onClick={goToHome}>
					Ir pra Home
				</Button>
			</View>
		</Page>
	)
}
