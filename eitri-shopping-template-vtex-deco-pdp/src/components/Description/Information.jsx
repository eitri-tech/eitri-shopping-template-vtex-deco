import { useTranslation } from 'eitri-i18n'
import CollapseWrapper from './components/CollapseWrapper'

export default function Information(props) {
	const { product } = props
	const { t } = useTranslation()

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
