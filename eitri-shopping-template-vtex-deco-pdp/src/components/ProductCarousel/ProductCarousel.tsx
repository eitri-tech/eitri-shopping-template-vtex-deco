import { useState } from 'react'
import { View, Carousel } from 'eitri-luminus'
import { Spacing } from 'eitri-shopping-template-vtex-deco-shared'
import ProductCard from '../ProductCard/ProductCard'
import type { VtexProduct } from '../../types/vtex'

interface ProductCarouselProps {
	products?: VtexProduct[]
}

export default function ProductCarousel(props: ProductCarouselProps) {
	const [currentSlide, setCurrentSlide] = useState(0)
	const { products } = props
	let pairedItems: VtexProduct[][] = []
	if (!Array.isArray(products)) {
		return null
	}
	// Carousel has no `beforeChange` prop — it only exposes `config.onChange(index)`. The
	// original call never fired, so `currentSlide` (and the pagination dots) never updated.
	const onChange = (index: number) => {
		setCurrentSlide(index)
	}
	const pairItems = (items: VtexProduct[]): VtexProduct[][] => {
		pairedItems = []
		for (let i = 0; i < items.length; i += 2) {
			pairedItems.push(items.slice(i, i + 2))
		}
		return pairedItems
	}
	return (
		<View>
			<Carousel config={{ onChange }}>
				{pairItems(products).map((group, index) => (
					<View
						key={index}
						className='flex flex flex-row justify-between p-2 items-center w-full'>
						{group.map(product => (
							<ProductCard
								key={product?.productId}
								product={product}
							/>
						))}
					</View>
				))}
			</Carousel>
			<Spacing height='10px' />
			{pairedItems?.length > 1 && (
				<View className='flex justify-center'>
					{pairedItems?.map((item, index) => {
						return (
							<View
								key={index}
								className={`w-32 h-6 ${currentSlide === index ? 'bg-primary-700' : 'bg-neutral-300'}`}
							/>
						)
					})}
				</View>
			)}
		</View>
	)
}
