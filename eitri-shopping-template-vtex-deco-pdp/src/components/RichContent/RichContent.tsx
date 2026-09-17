import { useEffect, useState } from 'react'
import { getProductById } from '../../services/productService'
import { View, Webview } from 'eitri-luminus'
import type { VtexProduct } from '../../types/vtex'

interface RichContentProps {
	product?: VtexProduct & { 'Conteudo Enriquecido'?: string }
}

export default function RichContent(props: RichContentProps) {
	const { product } = props
	const [richContent, setRichContent] = useState<string | null>(null)
	useEffect(() => {
		if (product) {
			if (product['Conteudo Enriquecido']) {
				setRichContent(product['Conteudo Enriquecido'])
			} else {
				getProductById(product.productId ?? '')
					.then((fetchedProduct: any) => {
						if (fetchedProduct['Conteudo Enriquecido']) {
							setRichContent(fetchedProduct['Conteudo Enriquecido'])
						}
					})
					.catch(err => console.error('RichContent: failed to load product', err))
			}
		}
	}, [product])
	if (!richContent) return null
	return (
		<View className='w-full h-full'>
			<Webview htmlString={richContent} />
		</View>
	)
}
