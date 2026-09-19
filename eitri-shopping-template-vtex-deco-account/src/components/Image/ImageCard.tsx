import { Image, View } from 'eitri-luminus'

interface ImageCardProps {
	imageUrl?: string
}

export default function ImageCard(props: ImageCardProps) {
	const { imageUrl } = props

	return (
		<View className='min-w-12 max-w-12 min-h-12 max-h-12 rounded flex justify-center items-center'>
			{imageUrl && (
				<Image
					src={imageUrl}
					className='max-w-full max-h-full'
				/>
			)}
		</View>
	)
}
