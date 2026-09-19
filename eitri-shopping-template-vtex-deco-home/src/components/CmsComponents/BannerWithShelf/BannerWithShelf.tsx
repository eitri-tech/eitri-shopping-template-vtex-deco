import { Text, View, Image } from 'eitri-luminus'
import { useState, useEffect } from 'react'
import { ChevronRightIcon } from 'eitri-shopping-template-vtex-deco-shared'
import Eitri from 'eitri-bifrost'
import { getProductsService } from '../../../services/ProductService'
import ShelfOfProductsSlider from '../../ShelfOfProducts/components/ShelfOfProductsSlider'
import { ProductImageShelf } from './ProductImageShelf'
import SectionTitle from '../../SectionTitle/SectionTitle'

interface BannerWithShelfData {
	title?: string
	imageUrl?: string
	externalImageUrl?: string
	aspectRatio?: string
	numberOfItems?: number
	mode?: string
	facets?: any[]
	term?: string
	sort?: string
	[key: string]: unknown
}

interface BannerWithShelfProps {
	data?: BannerWithShelfData
}

export default function BannerWithShelf(props: BannerWithShelfProps) {
	const { data } = props
	const [products, setProducts] = useState<any[]>([])
	const [isLoading, setIsLoading] = useState(false)

	useEffect(() => {
		fetchProducts()
	}, [data])

	const fetchProducts = async () => {
		if (!data) return
		setIsLoading(true)
		const params = {
			facets: data.facets || [],
			query: data.term ?? '',
			sort: data.sort ?? '',
			to: data.numberOfItems || 8
		}
		const result = await getProductsService(params as any)
		if (result) {
			setProducts(result.products)
		}
		setIsLoading(false)
	}

	const navigateToAll = () => {
		Eitri.navigation.navigate({
			path: 'ProductCatalog',
			state: {
				params: {
					facets: data?.facets || [],
					query: data?.term ?? '',
					sort: data?.sort ?? ''
				},
				title: data?.title
			}
		})
	}

	const imageUrl = data?.imageUrl || data?.externalImageUrl

	let proportionalHeight: number | string = 'auto'
	if (data?.aspectRatio) {
		try {
			const [aspectWidth, aspectHeight] = data.aspectRatio.split(':').map(Number)
			const screenWidth = window.innerWidth
			proportionalHeight = screenWidth * (aspectHeight / aspectWidth)
		} catch (e) {}
	}

	return (
		<View className='flex flex-col'>
			{data?.title && (
				<View className='flex justify-between items-center px-4 mb-2'>
					<SectionTitle
						title={data?.title}
						className='!px-0'
					/>
					<View
						onClick={navigateToAll}
						className='flex items-center min-w-fit text-neutral-content'>
						<Text className='underline text-neutral-content'>ver todos</Text>
						<ChevronRightIcon
							size={15}
							className='text-neutral-content ml-1'
						/>
					</View>
				</View>
			)}

			{imageUrl && (
				<View
					onClick={navigateToAll}
					height={proportionalHeight}
					className='mb-4 flex flex-row w-full'>
					<Image
						src={imageUrl}
						className='w-full h-full rounded'
					/>
				</View>
			)}

			{data?.mode === 'images'
				? <ProductImageShelf isLoading={isLoading} products={products} />
				: <ShelfOfProductsSlider isLoading={isLoading} products={products} />
			}
		</View>
	)
}
