import { View, Text, Image } from 'eitri-luminus'

// Deliberately minimal (not VtexCartItem[]) — this also renders shippingResolver's per-group
// `ProductRef[]` (id/imageUrl/name only, no index signature), which real cart items always
// satisfy but which itself doesn't satisfy a stricter, index-signature-bearing cart item type.
interface MiniProduct {
	id?: string
	imageUrl?: string
	name?: string
}

interface ReviewMiniProductsProps {
	products?: MiniProduct[]
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
