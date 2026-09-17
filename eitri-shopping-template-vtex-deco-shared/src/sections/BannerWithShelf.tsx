import { Text, View, Image } from 'eitri-luminus'
import { useState, useEffect } from 'react'
import Eitri from 'eitri-bifrost'
import { getProductsService } from '../services/ProductService'
import ShelfOfProductsSlider from '../components/ShelfOfProducts/components/ShelfOfProductsSlider'
import ProductImageShelf from '../components/ShelfOfProducts/components/ProductImageShelf'
import SectionTitle from '../components/SectionTitle/SectionTitle'
import ChevronRightIcon from '../components/ChevronRightIcon/ChevronRightIcon'
import type { Facet } from './types'
import type { ImageWidget } from '../types/widgets'

export interface Props {
	/**
	 * @title Título.
	 */
	title?: string
	facets?: Facet[]
	/**
	 * @title Termo de busca.
	 */
	term?: string
	sort?: string
	/**
	 * @title Quantidade de itens.
	 */
	numberOfItems?: number
	/**
	 * @title Modo de exibição (scroll | images).
	 */
	mode?: string
	/**
	 * @title URL da imagem do banner.
	 */
	imageUrl?: ImageWidget
	externalImageUrl?: string
	/**
	 * @title Proporção da imagem (ex.: "410:319").
	 */
	aspectRatio?: string
}

export default function BannerWithShelf({
	title,
	facets = [],
	term = '',
	sort = '',
	numberOfItems = 8,
	mode = 'scroll',
	imageUrl,
	externalImageUrl,
	aspectRatio
}: Props) {
	const [products, setProducts] = useState<any[]>([])
	const [isLoading, setIsLoading] = useState(false)

	// Chave primitiva evita loop de efeito quando `facets` chega como novo array a cada render.
	const facetsKey = JSON.stringify(facets)

	useEffect(() => {
		fetchProducts()
	}, [facetsKey, term, sort, numberOfItems])

	const fetchProducts = async () => {
		setIsLoading(true)
		const params = {
			facets: facets || [],
			query: term ?? '',
			sort: sort ?? '',
			to: numberOfItems || 8
		}
		const result = await getProductsService(params)
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
					facets: facets || [],
					query: term ?? '',
					sort: sort ?? ''
				},
				title
			}
		})
	}

	const resolvedImageUrl = imageUrl || externalImageUrl

	let proportionalHeight: string | number = 'auto'
	if (aspectRatio) {
		try {
			const [aspectWidth, aspectHeight] = aspectRatio.split(':').map(Number)
			const screenWidth = window.innerWidth
			proportionalHeight = screenWidth * (aspectHeight / aspectWidth)
		} catch (e) {}
	}

	return (
		<View className='flex flex-col'>
			{title && (
				<View className='flex justify-between items-center px-4 mb-2'>
					<SectionTitle
						title={title}
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

			{resolvedImageUrl && (
				<View
					onClick={navigateToAll}
					height={proportionalHeight}
					className='mb-4 flex flex-row w-full'>
					<Image
						src={resolvedImageUrl}
						className='w-full h-full rounded'
					/>
				</View>
			)}

			{mode === 'images'
				? <ProductImageShelf isLoading={isLoading} products={products} />
				: <ShelfOfProductsSlider isLoading={isLoading} products={products} />
			}
		</View>
	)
}
