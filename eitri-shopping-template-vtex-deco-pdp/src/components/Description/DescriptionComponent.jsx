import Description from './Description'
import Information from './Information'
import { Divisor } from 'eitri-shopping-template-vtex-deco-shared'

export default function DescriptionComponent(props) {
	const { product } = props

	return (
		<View className='w-full'>
			<Description description={product?.description} />
			<Information product={product} />
		</View>
	)
}
