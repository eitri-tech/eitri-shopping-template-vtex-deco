import { useTranslation } from 'eitri-i18n'
import CollapseWrapper from './components/CollapseWrapper'
import { App } from 'eitri-shopping-vtex-shared'
import { GenericBox } from 'eitri-shopping-template-vtex-deco-shared'

export default function Information(props) {
	const { product } = props
	const { t } = useTranslation()

	const buildSpecifications = product => {
		let result = []

		const hiddenProperties = App?.configs?.appConfigs?.pdp?.hiddenProperties

		const isExcluded = name => hiddenProperties?.includes(name)
		if (product?.properties) {
			return product?.properties?.filter(element => !isExcluded(element.name))
		} else {
			// Quando o produto vem através do intelligenceSearch a forma de pegar as especificações são diferente
			let allSpecifications = product?.specificationGroups?.find(
				group => group.originalName === 'allSpecifications'
			)
			allSpecifications?.specifications.forEach(element => {
				if (!isExcluded(element.name)) {
					result[element.name] = element.values
				}
			})
		}
		return [result]
	}

	const specifications = buildSpecifications(product)

	if (specifications.length === 0) return null

	return (
		<GenericBox>
			<CollapseWrapper
				title={t('information.txtInformation')}
				defaultCollapsed={true}>
				<View>
					{specifications?.map((specification, index) => (
						<View
							key={specification.name}
							className='mb-1'>
							<View>
								<Text className='font-bold mr-1'>{`${specification.name}: `}</Text>
							</View>

							<View
								key={index}
								className='flex flex-col'>
								<HTMLRender html={specification.values.join(', ')} />
							</View>
						</View>
					))}
				</View>
			</CollapseWrapper>
		</GenericBox>
	)
}
