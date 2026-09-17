import Eitri from 'eitri-bifrost'
import { HeaderContentWrapper, TrackingService, HEADER_VARIANT, useRetractableBottomBar } from 'eitri-shopping-template-vtex-deco-shared'
import SearchInput from '../components/SearchInput/SearchInput'
import { useLocalShoppingCart } from '../providers/LocalCart'
import ProductCatalogContent from '../components/ProductCatalogContent/ProductCatalogContent'
import { saveSearchHistory } from '../services/SearchMetadataService'
import { RemoteConfig } from 'eitri-shopping-vtex-shared'

export default function Search(props) {
	const incomingSearchTerm = props?.history?.location?.state?.searchTerm || props?.location?.state?.searchTerm
	const returnTo = props?.history?.location?.state?.returnTo || props?.location?.state?.returnTo
	const hiddenSortOptionsConfig = RemoteConfig.getContent(
		'appConfigs.home.hiddenCategorySortOptions'
	)
	const hiddenSortOptions = Array.isArray(hiddenSortOptionsConfig) ? hiddenSortOptionsConfig : []

	const { startCart } = useLocalShoppingCart()
	useRetractableBottomBar()

	const [params, setParams] = useState(null)
	const [pristine, setPristine] = useState(true)

	useEffect(() => {
		window.scroll(0, 0)

		if (incomingSearchTerm) {
			setPristine(false)
			const searchParams = {
				facets: [],
				query: incomingSearchTerm
			}
			setParams(searchParams)
			saveSearchHistory(incomingSearchTerm)
		}

		Eitri.eventBus.subscribe({
			channel: 'onUserTappedActiveTab',
			callback: _ => {
				Eitri.navigation.backToTop()
			}
		})

		Eitri.navigation.setOnResumeListener(() => {
			startCart()
		})

		TrackingService.sendScreenView('Busca', 'Search')
	}, [])

	const handleBack = () => {
		if (returnTo) {
			Eitri.navigation.navigate({ path: `/${returnTo}`, replace: true })
		} else {
			Eitri.navigation.back()
		}
	}

	const handleSearchSubmit = async term => {
		if (term) {
			setPristine(false)
			Eitri.keyboard.dismiss()
			try {
				const params = {
					facets: [],
					query: term
				}
				setParams(params)
			} catch (error) {
				console.log('handleSearchSubmit', error)
			}
			saveSearchHistory(term)
			TrackingService.searchEvent(term)
		}
	}

	return (
		<Page title='Busca'>
			<HeaderContentWrapper
				variant={HEADER_VARIANT.SCROLL_SOLID}
				className='gap-3 w-full justify-between relative'>
				<SearchInput
					autoFocus={!incomingSearchTerm}
					alwaysShowBackButton
					incomingValue={params?.query}
					onSubmit={handleSearchSubmit}
					onBack={handleBack}
				/>
			</HeaderContentWrapper>

			{/*{pristine && (*/}
			{/*	<View className='flex flex-col items-center justify-center py-12'>*/}
			{/*		<IoSearch className={'text-primary'} size={80} />*/}
			{/*		<Text className='text-primary text-2xl font-bold text-center mb-2'>O que você está buscando?</Text>*/}
			{/*		<Text className='text-base-content text-base text-center opacity-80'>*/}
			{/*			Nos diga o que procura e achamos pra você*/}
			{/*		</Text>*/}
			{/*	</View>*/}
			{/*)}*/}

			{params && (
				<ProductCatalogContent
					bottomInset={'auto'}
					params={params}
					title={params?.query}
					showFilters={true}
					hiddenSortOptions={hiddenSortOptions}
				/>
			)}
		</Page>
	)
}
