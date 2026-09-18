import { View } from 'eitri-luminus'
import Description from './Description'
import Information from './Information'
import type { VtexProduct } from '../../types/vtex'

interface DescriptionComponentProps {
	product?: VtexProduct
}

export default function DescriptionComponent(props: DescriptionComponentProps) {
	const { product } = props

	return (
		<View className='w-full'>
			<Description description={product?.description} />
			<Information product={product} />
		</View>
	)
}
