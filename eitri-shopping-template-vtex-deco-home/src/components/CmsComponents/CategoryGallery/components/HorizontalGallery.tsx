import { Image, Text, View } from 'eitri-luminus'

interface Category {
	title?: string
	imageUrl?: string
	[key: string]: unknown
}

interface HorizontalGalleryProps {
	categories: Category[]
	contentVisible?: boolean
	onClick: (category: Category) => void
	aspectRatio?: string
}

export default function HorizontalGallery(props: HorizontalGalleryProps) {
	const { categories, contentVisible, onClick, aspectRatio } = props

	return (
		<View
			className={`flex overflow-x-auto transition-opacity duration-150 ${contentVisible ? 'opacity-100' : 'opacity-0'}`}>
			<View className='flex flex-row gap-2 px-4'>
				{categories.map((category, index) => (
					<View
						key={index}
						className='flex flex-col items-center gap-1'
						onClick={() => onClick(category)}>
						<View
							className={`w-full ${aspectRatio ? '' : 'aspect-[3/4]'} bg-gray-100 overflow-hidden`}
							style={aspectRatio ? { aspectRatio: aspectRatio.replace(':', '/') } : undefined}>
							{category.imageUrl ? (
								<Image
									src={category.imageUrl}
									className='w-full h-full object-cover'
								/>
							) : null}
						</View>
						{category.title ? (
							<Text className='text-sm text-center text-gray-900 mt-1'>
								{category.title}
							</Text>
						) : null}
					</View>
				))}
			</View>
		</View>
	)
}
