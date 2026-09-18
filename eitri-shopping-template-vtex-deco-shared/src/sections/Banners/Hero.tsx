import { Image, Text, View } from 'eitri-luminus'
import type { ImageWidget } from '../../types/widgets'

export interface Props {
	/**
	 * @title Hero image.
	 */
	image: ImageWidget

	alt?: string

	description?: string
}

export default function HeroBanner({ image, alt, description }: Props) {
	return (
		<View
			width='100%'
			className='flex flex-col items-center justify-center'>
			<Image
				src={image}
				alt={alt}
				width='100%'
				className='object-cover'
			/>
			{description && <Text className='p-4 text-lg font-semibold text-primary'>{description}</Text>}
		</View>
	)
}
