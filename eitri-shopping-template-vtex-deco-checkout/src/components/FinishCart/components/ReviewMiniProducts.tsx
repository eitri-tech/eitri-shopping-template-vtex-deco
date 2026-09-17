import { View, Text, Image } from 'eitri-luminus'
import type { VtexCartItem } from '../../../types/vtex'

interface ReviewMiniProductsProps {
	products?: VtexCartItem[]
}

export default function ReviewMiniProducts(props: ReviewMiniProductsProps) {
	const { products } = props
	const items = Array.isArray(products) ? products : []

	return (
		<View className='flex flex-col gap-2'>
			{items.map((item, index) => (
				<View
					key={item?.imageUrl ?? item?.id ?? index}
					className='flex flex-row w-full gap-4'>
					{item?.imageUrl && (
						<Image
							src={item.imageUrl}
							className='w-[40px] object-cover'
						/>
					)}
					<Text className='text-sm'>{item?.name ?? ''}</Text>
				</View>
			))}
		</View>
	)
}
