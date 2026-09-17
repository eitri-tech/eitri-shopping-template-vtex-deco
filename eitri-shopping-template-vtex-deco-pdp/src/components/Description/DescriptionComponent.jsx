import Description from './Description'
import Information from './Information'
import { GenericBox } from 'eitri-shopping-template-vtex-deco-shared'

export default function DescriptionComponent(props) {
	const { product } = props

	return (
		<>
			<Description description={product?.description} />
			<Information product={product} />
		</>
	)
}
