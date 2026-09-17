import Eitri from 'eitri-bifrost'
import { View } from 'eitri-luminus'
import { BottomInset, TrackingService, Loading } from 'eitri-shopping-template-vtex-deco-shared'
import { useLocalShoppingCart } from '../providers/LocalCart'
import ImageGallery from '../components/ImageGallery/ImageGallery'
import MainDescription from '../components/MainDescription/MainDescription'
import SkuSelector from '../components/SkuSelector/SkuSelector'
import Freight from '../components/Freight/Freight'
import DescriptionComponent from '../components/Description/DescriptionComponent'
import RelatedProducts from '../components/RelatedProducts/RelatedProducts'
import { startConfigure } from '../services/AppService'
import Header from '../components/Header/Header'
import { saveCartIdOnStorage } from '../services/cartService'
import ActionButton from '../components/ActionButton/ActionButton'
import MaterialSwatches from '../components/MaterialSwatches/MaterialSwatches'
import Wishlist from '../components/Wishlist/Wishlist'
import ServiceLinks from '../components/ServiceLinks/ServiceLinks'
import BuyTogether from '../components/BuyTogether/BuyTogether'
import {
	getProductById,
	getProductBySlug,
	markLastViewedProduct,
	getProductSiblingsService
} from '../services/productService'
import { getAgrupadorCode } from 'eitri-shopping-template-vtex-deco-shared'
import { openProduct } from '../services/NavigationService'

export default function Home() {
	const { startCart } = useLocalShoppingCart()

	const [product, setProduct] = useState(null)
	const [isLoading, setIsLoading] = useState(null)
	const [configLoaded, setConfigLoaded] = useState(false)
	const [currentSku, setCurrentSku] = useState(null)
	const [siblings, setSiblings] = useState([])
	const [statusBarTextColor, setStatusBarTextColor] = useState()

	useEffect(() => {
		window.scroll(0, 0)

		console.log('Eitri.getInitializationInfos()')

		startHome()

		Eitri.navigation.setOnResumeListener(() => {
			startCart()
		})
	}, [])

	const startHome = async () => {
		setIsLoading(true)

		const startParams = await Eitri.getInitializationInfos()

		let product = await startParams.product
		if (product) {
			setProduct(product)
			setCurrentSku(findAvailableSKU(product))
			setIsLoading(false)
		}

		await loadConfigs()

		if (!product) {
			product = await loadProduct(startParams)
		}

		if (product) {
			setProduct(product)
			setCurrentSku(findAvailableSKU(product))
			setIsLoading(false)
			loadSiblings(product)
		}

		await loadCart(startParams)

		TrackingService.sendScreenView(product?.linkText, 'HomePdp')
		TrackingService.viewItemEvent(product)
		markLastViewedProduct(product)
	}

	const findAvailableSKU = product => {
		const availableSku = product.items.find(item =>
			item.sellers.some(seller => seller.commertialOffer?.AvailableQuantity > 0)
		)
		return availableSku || product.items[0]
	}

	const loadSiblings = async product => {
		try {
			const code = getAgrupadorCode(product)
			if (!code) return
			const products = await getProductSiblingsService(code)
			setSiblings(products)
		} catch (error) {
			console.error('Error loading product siblings', error)
		}
	}

	const loadProduct = async startParams => {
		try {
			if (startParams.productId) {
				return await getProductById(startParams.productId)
			}
			if (startParams.slug) {
				return await getProductBySlug(startParams.slug)
			}
		} catch (e) {
			console.error('loadProduct: Error', e)
			return null
		}
	}

	const loadCart = async startParams => {
		if (startParams?.orderFormId) {
			await saveCartIdOnStorage(startParams?.orderFormId)
		}
		await startCart()
	}

	const loadConfigs = async () => {
		try {
			await startConfigure()
			setConfigLoaded(true)
		} catch (e) {
			// crashLog('Erro ao buscar configurações', e)
			// crashLog()
		} finally {
			setStatusBarTextColor('black')
		}
	}

	const onSkuChange = newDesiredVariations => {
		const productSku = product.items.find(item => {
			return item.itemId === newDesiredVariations?.itemId
		})

		if (productSku) {
			setCurrentSku(productSku)
		}
	}

	return (
		<Page
			title={product?.linkText}
			statusBarTextColor={statusBarTextColor}>
			<Header
				product={product}
				configLoaded={configLoaded}
			/>

			<Loading
				isLoading={isLoading}
				fullScreen
			/>

			{product && (
				<View>
					<View className='pb-4'>
						<ImageGallery currentSku={currentSku} />

						<View className='mt-4 px-4 flex flex-col gap-4'>
							<View className='flex flex-row items-start justify-between gap-2'>
								<View className='flex-1'>
									<MainDescription
										product={product}
										currentSku={currentSku}
										configLoaded={configLoaded}
									/>
								</View>
								<Wishlist
									product={product}
									configLoaded={configLoaded}
								/>
							</View>

							<SkuSelector
								currentSku={currentSku}
								product={product}
								onSkuChange={onSkuChange}
							/>

							<MaterialSwatches
								currentProductId={product.productId}
								currentProduct={product}
								siblings={siblings}
								onSwatchPress={openProduct}
							/>
						</View>

						<View className='px-4 flex flex-col gap-4 mt-4'>
							{/*<RichContent product={product} />*/}

							<DescriptionComponent product={product} />
						</View>

						{configLoaded && <Freight currentSku={currentSku} />}

						{configLoaded && <ServiceLinks />}

						{configLoaded && product && <RelatedProducts product={product} />}

						{/* {configLoaded && (
							<BuyTogether
								product={product}
								currentSku={currentSku}
							/>
						)} */}
					</View>

					<ActionButton
						product={product}
						currentSku={currentSku}
					/>

					<BottomInset />
				</View>
			)}
		</Page>
	)
}
