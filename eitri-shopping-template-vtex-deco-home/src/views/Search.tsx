import { useState, useEffect } from 'react'
import { Page } from 'eitri-luminus'
import Eitri from 'eitri-bifrost'
import { HeaderContentWrapper, TrackingService, HEADER_VARIANT, useRetractableBottomBar } from 'eitri-shopping-template-vtex-deco-shared'
import SearchInput from '../components/SearchInput/SearchInput'
import { useLocalShoppingCart } from '../providers/LocalCart'
import ProductCatalogContent from '../components/ProductCatalogContent/ProductCatalogContent'
import { saveSearchHistory } from '../services/SearchMetadataService'
import { RemoteConfig } from 'eitri-shopping-vtex-shared'
import type { RouteProps } from '../types/route'

interface SearchState {
	searchTerm?: string
	// Screen to go back to instead of the navigation stack (e.g. 'Categories').
	returnTo?: string
}

interface SearchQueryParams {
	facets: Array<{ key: string; value: string }>
	query: string
	[key: string]: unknown
}

export default function Search(props: RouteProps<SearchState>) {
	const incomingSearchTerm = props?.history?.location?.state?.searchTerm || props?.location?.state?.searchTerm
	const returnTo = props?.history?.location?.state?.returnTo || props?.location?.state?.returnTo
	const hiddenSortOptionsConfig = RemoteConfig.getContent('appConfigs.home.hiddenCategorySortOptions')
	const hiddenSortOptions: string[] = Array.isArray(hiddenSortOptionsConfig)
		? (hiddenSortOptionsConfig as string[])
		: []

	const { startCart } = useLocalShoppingCart()
	useRetractableBottomBar()

	const [params, setParams] = useState<SearchQueryParams | null>(null)
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

		// eventBus.subscribe's own docs say custom string channels are supported, but the .d.ts
		// only types `channel` as the EventBusCommonEvents enum — cast to keep this custom channel
		// (same pattern already established in account/src/utils/backToTopListener.ts).
		Eitri.eventBus.subscribe({
			channel: 'onUserTappedActiveTab' as any,
			callback: _ => {
				Eitri.navigation.backToTop()
			}
		})

		Eitri.navigation.setOnResumeListener(() => {
			startCart?.()
		})

		TrackingService.sendScreenView('Busca', 'Search')
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const handleBack = () => {
		if (returnTo) {
			Eitri.navigation.navigate({ path: `/${returnTo}`, replace: true })
		} else {
			Eitri.navigation.back(1)
		}
	}

	const handleSearchSubmit = async (term: string) => {
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
