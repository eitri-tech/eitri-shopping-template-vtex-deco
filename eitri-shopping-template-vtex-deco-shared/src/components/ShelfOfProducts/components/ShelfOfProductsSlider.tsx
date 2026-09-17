import { useRef, useState, useCallback } from 'react'
import ProductCard from '../../ProductCard/ProductCard'
import { View } from 'eitri-luminus'
import SliderPagination from '../../SliderPagination/SliderPagination'
import type { Product } from '../../../types/product'

export interface Props {
	isLoading?: boolean
	products?: Product[]
}

export default function ShelfOfProductsSlider({ isLoading, products }: Props) {
	const scrollRef = useRef<any>(null)
	const [activeIndex, setActiveIndex] = useState(0)
	const itemCount = products?.length || 0

	const handleScroll = useCallback(
		(e: any) => {
			const el = e.currentTarget
			if (!scrollRef.current) scrollRef.current = el
			const maxScroll = el.scrollWidth - el.clientWidth
			if (maxScroll <= 0) return
			const index = Math.round((el.scrollLeft / maxScroll) * (itemCount - 1))
			setActiveIndex(Math.max(0, Math.min(index, itemCount - 1)))
		},
		[itemCount]
	)

	const scrollByStep = (direction: number) => {
		const el = scrollRef.current
		if (!el) return
		const maxScroll = el.scrollWidth - el.clientWidth
		if (maxScroll <= 0) return
		const step = maxScroll / Math.max(1, itemCount - 1)
		const target = Math.max(0, Math.min(maxScroll, el.scrollLeft + direction * step))
		if (typeof el.scrollTo === 'function') {
			el.scrollTo({ left: target, behavior: 'smooth' })
		} else {
			el.scrollLeft = target
		}
	}

	return (
		<>
			{isLoading ? (
				<View className='flex overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'>
					<View className='flex gap-4 px-4 py-2'>
						<View className='mt-2 min-w-[50vw] h-[388px] bg-gray-200 rounded animate-pulse' />
						<View className='mt-2 min-w-[50vw] h-[388px] bg-gray-200 rounded animate-pulse' />
						<View className='mt-2 min-w-[50vw] h-[388px] bg-gray-200 rounded animate-pulse' />
					</View>
				</View>
			) : (
				<>
					<View
						ref={scrollRef}
						onScroll={handleScroll}
						className='flex overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'>
						<View className='flex gap-4 px-4 py-2'>
							{products?.map(product => (
								<ProductCard
									key={product.productId}
									product={product}
									className='w-[50vw]'
								/>
							))}
						</View>
					</View>
					<SliderPagination
						count={itemCount}
						activeIndex={activeIndex}
						className='mt-2'
						onPrev={() => scrollByStep(-1)}
						onNext={() => scrollByStep(1)}
					/>
				</>
			)}
		</>
	)
}
