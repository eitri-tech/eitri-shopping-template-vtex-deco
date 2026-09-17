import { Text, View } from 'eitri-luminus'
import SectionTitle from '../../../SectionTitle/SectionTitle'
export default function GridList(props) {
	const { data, onClick } = props
	const imagesList = data?.images

	const gap = data.gap || 8

	return (
		<View>
			<SectionTitle title={data.mainTitle} />
			<View
				style={{ gap: `${gap}px` }}
				className='grid grid-cols-2 px-4'>
				{imagesList?.map(image => (
					<View
						key={image.imageUrl || image.externalImageUrl}
						onClick={() => onClick(image)}
						className='' // Adjust for two items per row with spacing
					>
						<Image
							src={image.imageUrl || image.externalImageUrl}
							className='w-full h-auto rounded'
						/>
						{image.subLabel && (
							<Text className='block text-sm font-bold text-center mt-1 text-gray-700'>
								{image.subLabel}
							</Text>
						)}
					</View>
				))}
			</View>
		</View>
	)
}
