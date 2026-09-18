import { useState } from 'react'
import { View } from 'eitri-luminus'
import ProductCard from '../../ProductCard/ProductCard'
import { CustomCarousel } from 'eitri-shopping-template-vtex-deco-shared'
import type { VtexProduct } from '../../../types/vtex'

interface ShelfOfProductsCarouselProps {
	isLoading?: boolean
	products?: VtexProduct[]
}

export default function ShelfOfProductsCarousel(props: ShelfOfProductsCarouselProps) {
	const { isLoading, products } = props
	const [currentSlide, setCurrentSlide] = useState(0)
	const products_per_page = 2

	const productsPage: VtexProduct[][] = []
	if (Array.isArray(products)) {
		for (let i = 0; i < products.length; i += products_per_page) {
			productsPage.push(products.slice(i, i + products_per_page))
		}
	}

	const handleScroll = (e: number) => {
		setCurrentSlide(e)
	}

	return (
		<>
			{isLoading ? (
				<View className='flex overflow-x-auto'>
					<View className='flex gap-4 px-4 py-2'>
						<View className='mt-2 w-[148px] h-[131px] bg-gray-200 rounded-2xl animate-pulse' />
						<View className='mt-2 w-[148px] h-[131px] bg-gray-200 rounded-2xl animate-pulse' />
						<View className='mt-2 w-[148px] h-[131px] bg-gray-200 rounded-2xl animate-pulse' />
					</View>
				</View>
			) : (
				<>
					<CustomCarousel
						autoPlay={false}
						loop={true}
						onSlideChange={handleScroll}>
						{productsPage.map((page, index) => (
							<View
								key={page?.[0]?.productId || index}
								className='grid grid-cols-2 gap-4 px-4 py-2'>
								<ProductCard product={page[0]} />
								{page.length > 1 && <ProductCard product={page[1]} />}
							</View>
						))}
					</CustomCarousel>
					{productsPage.length > 1 && (
						<View className='flex justify-center gap-2 mt-2'>
							{productsPage.map((_, index) => (
								<View
									key={index}
									className={`${currentSlide === index ? 'w-[36px]' : 'w-[12px]'} h-[6px] rounded-lg ${
										currentSlide === index ? 'bg-primary' : 'bg-base-300'
									} transition-[width,background-color] duration-300 ease-in-out"`}
								/>
							))}
						</View>
					)}
				</>
			)}
		</>
	)
}
