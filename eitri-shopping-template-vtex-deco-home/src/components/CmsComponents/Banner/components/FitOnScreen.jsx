import { Text, View } from 'eitri-luminus'
import SectionTitle from '../../../SectionTitle/SectionTitle'
export default function FitOnScreen(props) {
	const { data, onClick } = props

	return (
		<View>
			<SectionTitle title={data.mainTitle} />
			<View className={`flex justify-between ${data?.images.length > 1 ? 'px-4' : ''} gap-2`}>
				{data?.images?.map(image => (
					<View
						key={image.imageUrl}
						onClick={() => onClick(image)}>
						<Image
							src={image.imageUrl}
							className={'rounded'}
						/>
						{image.action?.title && <Text className='text-center mt-2'>{image.action.title}</Text>}
					</View>
				))}
			</View>
		</View>
	)
}
