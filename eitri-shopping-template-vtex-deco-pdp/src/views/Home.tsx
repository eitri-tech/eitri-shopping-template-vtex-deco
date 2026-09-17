import { useEffect, useState } from 'react'
import Eitri from 'eitri-bifrost'
import { Page, View } from 'eitri-luminus'
import { BottomInset, TrackingService, Loading } from 'eitri-shopping-template-vtex-deco-shared'
import { useLocalShoppingCart } from '../providers/LocalCart'
import ImageCarousel from '../components/ImageCarousel/ImageCarousel'
import MainDescription from '../components/MainDescription/MainDescription'
import SkuSelector from '../components/SkuSelector/SkuSelector'
import Freight from '../components/Freight/Freight'
import DescriptionComponent from '../components/Description/DescriptionComponent'
import RelatedProducts from '../components/RelatedProducts/RelatedProducts'
import { startConfigure } from '../services/AppService'
import Header from '../components/Header/Header'
import { saveCartIdOnStorage } from '../services/cartService'
import ActionButton from '../components/ActionButton/ActionButton'
import { getProductById, getProductBySlug, markLastViewedProduct } from '../services/productService'
import type { VtexProduct, VtexSku } from '../types/vtex'

interface StartParams {
	product?: VtexProduct
	productId?: string
	slug?: string
	orderFormId?: string
	[key: string]: unknown
}

export default function Home() {
	const { startCart } = useLocalShoppingCart()

	const [product, setProduct] = useState<VtexProduct | null>(null)
	const [isLoading, setIsLoading] = useState<boolean | null>(null)
	const [configLoaded, setConfigLoaded] = useState(false)
	const [currentSku, setCurrentSku] = useState<VtexSku | null>(null)

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

		const startParams = (await Eitri.getInitializationInfos()) as StartParams

		let product = startParams.product
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
		}

		await loadCart(startParams)

		TrackingService.sendScreenView(product?.linkText ?? '', 'HomePdp')
		if (product) {
			TrackingService.viewItemEvent(product)
			markLastViewedProduct(product)
		}
	}

	const findAvailableSKU = (product: VtexProduct): VtexSku | null => {
		const availableSku = product.items?.find(item =>
			item.sellers?.some(seller => (seller.commertialOffer?.AvailableQuantity ?? 0) > 0)
		)
		return availableSku || product.items?.[0] || null
	}

	const loadProduct = async (startParams: StartParams): Promise<VtexProduct | undefined> => {
		try {
			if (startParams.productId) {
				return await getProductById(startParams.productId)
			}
			if (startParams.slug) {
				return await getProductBySlug(startParams.slug)
			}
		} catch (e) {
			console.error('loadProduct: Error', e)
			return undefined
		}
	}

	const loadCart = async (startParams: StartParams) => {
		if (startParams?.orderFormId) {
			await saveCartIdOnStorage(startParams.orderFormId)
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
		}
	}

	const onSkuChange = (newDesiredVariations: { itemId?: string } | null) => {
		const productSku = product?.items?.find(item => {
			return item.itemId === newDesiredVariations?.itemId
		})

		if (productSku) {
			setCurrentSku(productSku)
		}
	}

	return (
		<Page title={product?.linkText}>
			<Header />

			<Loading
				isLoading={!!isLoading}
				fullScreen
			/>

			{product && (
				<View>
					<View className='pb-4'>
						{currentSku && <ImageCarousel currentSku={currentSku} />}

						<View className='mt-4 px-4 flex flex-col gap-4'>
							<MainDescription
								product={product}
								currentSku={currentSku ?? undefined}
							/>

							<SkuSelector
								currentSku={currentSku ?? undefined}
								product={product}
								onSkuChange={onSkuChange}
							/>

							{configLoaded && <Freight currentSku={currentSku ?? undefined} />}

							{/*<RichContent product={product} />*/}

							<DescriptionComponent product={product} />
						</View>

						{configLoaded && <RelatedProducts product={product} />}
					</View>

					<ActionButton
						product={product}
						currentSku={currentSku ?? undefined}
					/>

					<BottomInset />
				</View>
			)}
		</Page>
	)
}
