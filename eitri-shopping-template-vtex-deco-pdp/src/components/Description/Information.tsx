import { View, Text, HTMLRender } from 'eitri-luminus'
import { useTranslation } from 'eitri-i18n'
import CollapseWrapper from './components/CollapseWrapper'
import { App } from 'eitri-shopping-vtex-shared'
import { GenericBox } from 'eitri-shopping-template-vtex-deco-shared'
import type { VtexProduct } from '../../types/vtex'

interface Specification {
	name?: string
	values?: string[]
}

interface InformationProps {
	product?: VtexProduct
}

export default function Information(props: InformationProps) {
	const { product } = props
	const { t } = useTranslation()

	const buildSpecifications = (product?: VtexProduct): Specification[] => {
		const hiddenProperties = (App as any)?.configs?.appConfigs?.pdp?.hiddenProperties as string[] | undefined

		const isExcluded = (name?: string) => hiddenProperties?.includes(name ?? '')
		if (product?.properties) {
			return product?.properties?.filter(element => !isExcluded(element.name))
		} else {
			// Quando o produto vem através do intelligenceSearch a forma de pegar as especificações são diferente
			let result: Specification[] = []
			let allSpecifications = product?.specificationGroups?.find(
				group => group.originalName === 'allSpecifications'
			)
			// The original built this as `result[element.name] = element.values` on an array —
			// that sets a non-index property, never actually populates the array, and produces
			// {name: undefined, values: undefined} downstream, crashing on `.values.join(...)`.
			allSpecifications?.specifications?.forEach(element => {
				if (!isExcluded(element.name)) {
					result.push({ name: element.name, values: element.values })
				}
			})
			return result
		}
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
								<HTMLRender html={(specification.values ?? []).join(', ')} />
							</View>
						</View>
					))}
				</View>
			</CollapseWrapper>
		</GenericBox>
	)
}
