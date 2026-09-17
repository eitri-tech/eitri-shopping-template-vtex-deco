import { useTranslation } from 'eitri-i18n'
import CollapseWrapper from './components/CollapseWrapper'

export default function Description(props) {
	const { description } = props
	const { t } = useTranslation()
	const descriptionWithoutCharacteristics = description
		?.replace(
			/<div\b[^>]*class\s*=\s*(['"])[^'"]*\binfoProdutos\b[^'"]*\1[^>]*>[\s\S]*?<\/div>\s*/i,
			''
		)
		.trim()

	if (!descriptionWithoutCharacteristics) return null

	return (
		<CollapseWrapper
			title={t('description.txtDescription')}
			defaultCollapsed={false}>
			<HTMLRender html={descriptionWithoutCharacteristics} />
		</CollapseWrapper>
	)
}
