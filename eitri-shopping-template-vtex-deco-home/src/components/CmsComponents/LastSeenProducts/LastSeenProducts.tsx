import { useState, useEffect } from 'react'
import Eitri from 'eitri-bifrost'
import { getProductById } from '../../../services/ProductService'
import ShelfOfProducts from '../../ShelfOfProducts/ShelfOfProducts'
import type { VtexProduct } from '../../../types/vtex'

interface LastSeenProductsData {
	mode?: string
	title?: string
	[key: string]: unknown
}

interface LastSeenProductsProps {
	data?: LastSeenProductsData
}

interface LastSeenEntry {
	productId?: string
	[key: string]: unknown
}

export default function LastSeenProducts(props: LastSeenProductsProps) {
	const { data } = props
	const [products, setProducts] = useState<VtexProduct[]>([])
	const [isLoading, setIsLoading] = useState(false)

	useEffect(() => {
		loadLastSeenProducts()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const loadLastSeenProducts = async () => {
		try {
			setIsLoading(true)
			const result = (await Eitri.sharedStorage.getItemJson('last-seen-products')) as LastSeenEntry[] | undefined
			if (!result || result.length === 0) return
			const _products = await Promise.all(
				result.slice(0, 8).map(async item => {
					const cachedProduct = products.find(product => product.id === item.productId)
					if (cachedProduct) return Promise.resolve(cachedProduct)
					return await getProductById(item.productId ?? '')
				})
			)
			setProducts(_products.filter((product): product is VtexProduct => Boolean(product)))
			setIsLoading(false)
		} catch (error) {
			setIsLoading(false)
		}
	}

	if (!products || products.length === 0) return null

	return (
		<ShelfOfProducts
			mode={data?.mode || 'carousel'}
			title={data?.title}
			products={products}
			isLoading={isLoading}
		/>
	)
}
