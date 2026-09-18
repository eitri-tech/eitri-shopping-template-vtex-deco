import { HTMLRender } from 'eitri-luminus'
import { useTranslation } from 'eitri-i18n'
import CollapseWrapper from './components/CollapseWrapper'

interface DescriptionProps {
	description?: string
}

export default function Description(props: DescriptionProps) {
	const { description } = props
	const { t } = useTranslation()

	// The `infoProdutos` div is rendered separately by Information — strip it here so it isn't shown twice.
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
