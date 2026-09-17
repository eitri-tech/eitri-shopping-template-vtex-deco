import Eitri from 'eitri-bifrost'
import { useState, useEffect } from 'react'
import { getProductById } from '../services/ProductService'
import ShelfOfProducts from '../components/ShelfOfProducts/ShelfOfProducts'

export interface Props {
	/**
	 * @title Título.
	 */
	title?: string
	/**
	 * @title Modo de exibição (carousel | scroll).
	 */
	mode?: string
}

export default function LastSeenProducts({ title, mode = 'carousel' }: Props) {
	const [products, setProducts] = useState<any[]>([])
	const [isLoading, setIsLoading] = useState(false)

	useEffect(() => {
		loadLastSeenProducts()
	}, [])

	const loadLastSeenProducts = async () => {
		try {
			setIsLoading(true)
			const result = await Eitri.sharedStorage.getItemJson('last-seen-products')
			if (!result || result.length === 0) return
			const _products = await Promise.all(
				result.slice(0, 8).map(async (item: any) => {
					const cachedProduct = products.find(product => product.id === item.productId)
					if (cachedProduct) return cachedProduct
					return await getProductById(item.productId)
				})
			)
			setProducts(_products.filter(product => !!product))
			setIsLoading(false)
		} catch (error) {
			setIsLoading(false)
		}
	}

	if (!products || products.length === 0) return null

	return (
		<ShelfOfProducts
			mode={mode || 'carousel'}
			title={title}
			products={products}
			isLoading={isLoading}
		/>
	)
}
