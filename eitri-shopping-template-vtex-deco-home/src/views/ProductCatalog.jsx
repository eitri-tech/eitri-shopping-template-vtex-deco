import { HeaderContentWrapper, HeaderReturn, TrackingService, BottomInset, HEADER_VARIANT, useRetractableBottomBar } from 'eitri-shopping-template-vtex-deco-shared'

import Eitri from 'eitri-bifrost'
import { useTranslation } from 'eitri-i18n'
import { RemoteConfig } from 'eitri-shopping-vtex-shared'
import ProductCatalogContent from '../components/ProductCatalogContent/ProductCatalogContent'

export default function ProductCatalog(props) {
	useRetractableBottomBar()
	const { location } = props
	const { t } = useTranslation()
	const hiddenSortOptionsConfig = RemoteConfig.getContent(
		'appConfigs.home.hiddenCategorySortOptions'
	)
	const hiddenCategorySortOptions = Array.isArray(hiddenSortOptionsConfig)
		? hiddenSortOptionsConfig
		: []

	const title = location.state.title
	const openInBottomBar = !!location.state.openInBottomBar
	const params = location.state.params
	const receivedCategoryNames = location.state.categoryNames

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
	const formatCategoryName = value => {
		try {
			return decodeURIComponent(value)
				.replace(/-/g, ' ')
				.split(' ')
				.map(word => word.charAt(0).toUpperCase() + word.slice(1))
				.join(' ')
		} catch {
			return value
		}
	}

	const getCategoryNames = () => {
		if (Array.isArray(receivedCategoryNames) && receivedCategoryNames.length > 0) {
			return receivedCategoryNames.filter(Boolean)
		}

		const categories = (params?.facets || [])
			.filter(facet => facet?.key?.startsWith('category-'))
			.sort((first, second) => {
				const firstLevel = Number(first.key.replace('category-', ''))
				const secondLevel = Number(second.key.replace('category-', ''))
				return firstLevel - secondLevel
			})
			.map(facet => formatCategoryName(facet.value))

		if (title && categories.length > 0) {
			categories[categories.length - 1] = title
		}

		return categories
	}

	const categoryNames = getCategoryNames()
	const categoryTitle = categoryNames[categoryNames.length - 1] || title || t('productCatalog.title')
	const breadcrumb = categoryNames.join(' > ')

	return (
		<Page title={categoryTitle}>
			<>
				<HeaderContentWrapper
					variant={HEADER_VARIANT.SCROLL_SOLID}
					className='!items-stretch flex-col !gap-2 !py-4'>
					<View className='flex items-center justify-between min-h-[40px]'>
						<View className='flex items-center gap-3 min-w-0'>
							{!openInBottomBar && <HeaderReturn className='shrink-0' />}
							<View
								orientation='column'
								className='min-w-0'>
								<Text className='text-2xl font-normal text-black line-clamp-1'>{categoryTitle}</Text>
								{breadcrumb && breadcrumb !== categoryTitle && (
									<Text className='text-base text-black line-clamp-1'>{breadcrumb}</Text>
								)}
							</View>
						</View>
					</View>
				</HeaderContentWrapper>

				{appliedFacets && (
					<ProductCatalogContent
						banner={location?.state?.banner}
						params={appliedFacets}
						title={categoryTitle}
						showFilters={true}
						hiddenSortOptions={hiddenCategorySortOptions}
					/>
				)}

				<BottomInset />
			</>
		</Page>
	)
}
