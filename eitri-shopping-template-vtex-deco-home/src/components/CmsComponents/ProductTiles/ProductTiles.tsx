import { useState, useEffect } from 'react'
import { getProductsService } from '../../../services/ProductService'
import { Text, View } from 'eitri-luminus'
import ShelfOfProducts from '../../ShelfOfProducts/ShelfOfProducts'
import SectionTitle from '../../SectionTitle/SectionTitle'
import type { VtexProduct } from '../../../types/vtex'

interface ProductTilesShelf {
	title?: string
	facets?: Array<{ key: string; value: string }>
	term?: string
	sort?: string
	numberOfItems?: number
	[key: string]: unknown
}

interface ProductTilesData {
	title?: string
	mode?: string
	shelves?: ProductTilesShelf[]
	[key: string]: unknown
}

interface ProductTilesProps {
	data: ProductTilesData
}

export default function ProductTiles(props: ProductTilesProps) {
	const { data } = props
	const [shelves, setShelves] = useState<ProductTilesShelf[]>([])
	const [currentShelf, setCurrentShelf] = useState<ProductTilesShelf>({})
	const [currentProducts, setCurrentProducts] = useState<VtexProduct[]>([])
	const [isLoadingProducts, setIsLoadingProducts] = useState(false)
	const [cachedProducts, setCachedProducts] = useState<Record<string, VtexProduct[]>>({})

	useEffect(() => {
		if (data?.shelves) {
			setShelves(data.shelves)
			setCurrentShelf(data.shelves[0] ?? {})
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data])

	useEffect(() => {
		executeProductSearch(currentShelf)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentShelf])

	const executeProductSearch = async (shelf: ProductTilesShelf) => {
		try {
			const shelfTitle = shelf.title ?? ''
			if (cachedProducts[shelfTitle]) {
				setCurrentProducts(cachedProducts[shelfTitle])
				return
			}

			setIsLoadingProducts(true)

			const params = {
				facets: shelf.facets || [],
				query: shelf.term ?? '',
				sort: shelf.sort ?? '',
				to: shelf.numberOfItems || 8
			}

			const result = await getProductsService(params)
			const resultProducts: VtexProduct[] = result?.products ?? []

			setCurrentProducts(resultProducts)
			setIsLoadingProducts(false)
			setCachedProducts({
				...cachedProducts,
				[shelfTitle]: resultProducts
			})
		} catch (e) {
			console.error('executeProductSearch.error', e)
		}
	}

	const onChooseShelf = (shelf: ProductTilesShelf) => {
		setCurrentShelf(structuredClone(shelf))
	}

	return (
		<View>
			<SectionTitle title={data?.title} />
			<View className='overflow-x-auto flex px-4 gap-2 mb-1'>
				{shelves?.map(shelf => (
					<View
						key={shelf.title}
						onClick={() => onChooseShelf(shelf)}
						className={`py-1 px-3 border min-w-fit rounded ${
							shelf.title === currentShelf.title ? 'border-primary' : 'border-neutral-400'
						}`}>
						<Text className={`${shelf.title === currentShelf.title ? 'text-primary' : 'text-neutral-400'}`}>
							{shelf.title}
						</Text>
					</View>
				))}
			</View>
			<ShelfOfProducts
				mode={data.mode || 'scroll'}
				isLoading={isLoadingProducts}
				products={currentProducts}
			/>
		</View>
	)
}
