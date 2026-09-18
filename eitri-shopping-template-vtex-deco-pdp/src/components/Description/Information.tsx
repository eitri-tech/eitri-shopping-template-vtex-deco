import { HTMLRender } from 'eitri-luminus'
import { useTranslation } from 'eitri-i18n'
import CollapseWrapper from './components/CollapseWrapper'
import type { VtexProduct } from '../../types/vtex'

interface InformationProps {
	product?: VtexProduct
}

export default function Information(props: InformationProps) {
	const { product } = props
	const { t } = useTranslation()

	// Technical details are authored inside an `infoProdutos` div within the HTML description.
	const technicalDetails = product?.description?.match(
		/<div\b[^>]*class\s*=\s*(['"])[^'"]*\binfoProdutos\b[^'"]*\1[^>]*>[\s\S]*?<\/div>/i
	)?.[0]

	if (!technicalDetails) return null

	return (
		<CollapseWrapper
			title={t('information.txtInformation')}
			defaultCollapsed={true}>
			<HTMLRender html={technicalDetails} />
		</CollapseWrapper>
	)
}
