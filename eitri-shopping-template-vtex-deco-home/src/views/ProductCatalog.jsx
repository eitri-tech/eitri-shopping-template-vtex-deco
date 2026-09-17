import {
	HeaderContentWrapper,
	HeaderReturn,
	HeaderText,
	HeaderSearchIcon,
	TrackingService,
	BottomInset
} from 'eitri-shopping-template-vtex-deco-shared'

import Eitri from 'eitri-bifrost'
import { useTranslation } from 'eitri-i18n'
import ProductCatalogContent from '../components/ProductCatalogContent/ProductCatalogContent'
import SearchInput from '../components/SearchInput/SearchInput'

export default function ProductCatalog(props) {
	const { location } = props
	const { t } = useTranslation()

	const title = location.state.title
	const openInBottomBar = !!location.state.openInBottomBar
	const showTitle = !!location.state.showTitle

	const [appliedFacets, setAppliedFacets] = useState(null)

	useEffect(() => {
		const params = location.state.params
		setAppliedFacets(params)

		if (!openInBottomBar) {
			Eitri.eventBus.subscribe({
				channel: 'onUserTappedActiveTab',
				callback: _ => {
					Eitri.navigation.back()
				}
			})
		}

		TrackingService.sendScreenView('Catálogo de produtos', 'ProductCatalog')
	}, [])

	const handleSearch = term => {
		Eitri.keyboard.dismiss()
		Eitri.navigation.navigate({ path: 'Search', state: { searchTerm: term } })
	}

	return (
		<Page title={title || t('productCatalog.title')}>
			<>
				<HeaderContentWrapper className={`justify-between`}>
					<View className={`flex items-center gap-4`}>
						{!openInBottomBar && <HeaderReturn />}
						<HeaderText text={title} />
					</View>

					<HeaderSearchIcon onClick={() => Eitri.navigation.navigate({ path: 'Search' })} />
				</HeaderContentWrapper>

				{appliedFacets && (
					<ProductCatalogContent
						banner={location?.state?.banner}
						params={appliedFacets}
						showFilters={true}
					/>
				)}

				<BottomInset />
			</>
		</Page>
	)
}
