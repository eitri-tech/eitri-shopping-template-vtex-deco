import { Text, View } from 'eitri-luminus'
import { useState, useEffect } from 'react'
import { getProductsService } from '../services/ProductService'
import ShelfOfProducts from '../components/ShelfOfProducts/ShelfOfProducts'
import SectionTitle from '../components/SectionTitle/SectionTitle'
import type { Facet } from './types'

export interface ProductTileShelf {
	/**
	 * @title Título da aba.
	 */
	title: string
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
}

export interface Props {
	/**
	 * @title Título da seção.
	 */
	title?: string
	shelves?: ProductTileShelf[]
	/**
	 * @title Modo de exibição (scroll | carousel).
	 */
	mode?: string
}

export default function ProductTiles({ title, shelves = [], mode = 'scroll' }: Props) {
	const [currentShelf, setCurrentShelf] = useState<ProductTileShelf | null>(null)
	const [currentProducts, setCurrentProducts] = useState<any[]>([])
	const [isLoadingProducts, setIsLoadingProducts] = useState(false)
	const [cachedProducts, setCachedProducts] = useState<Record<string, any[]>>({})

	useEffect(() => {
		if (shelves.length) {
			setCurrentShelf(shelves[0])
		}
	}, [shelves])

	useEffect(() => {
		if (currentShelf) executeProductSearch(currentShelf)
	}, [currentShelf])

	const executeProductSearch = async (shelf: ProductTileShelf) => {
		try {
			if (cachedProducts[shelf.title]) {
				setCurrentProducts(cachedProducts[shelf.title])
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

			setCurrentProducts(result.products)
			setIsLoadingProducts(false)
			setCachedProducts(prev => ({
				...prev,
				[shelf.title]: result.products
			}))
		} catch (e) {
			console.error('executeProductSearch.error', e)
		}
	}

	const onChooseShelf = (shelf: ProductTileShelf) => {
		setCurrentShelf(structuredClone(shelf))
	}

	return (
		<View>
			<SectionTitle title={title} />
			<View className='overflow-x-auto flex px-4 gap-2 mb-1'>
				{shelves.map(shelf => (
					<View
						key={shelf.title}
						onClick={() => onChooseShelf(shelf)}
						className={`py-1 px-3 border min-w-fit rounded ${
							shelf.title === currentShelf?.title ? 'border-primary' : 'border-neutral-400'
						}`}>
						<Text
							className={`${shelf.title === currentShelf?.title ? 'text-primary' : 'text-neutral-400'}`}>
							{shelf.title}
						</Text>
					</View>
				))}
			</View>
			<ShelfOfProducts
				mode={mode || 'scroll'}
				isLoading={isLoadingProducts}
				products={currentProducts}
			/>
		</View>
	)
}
