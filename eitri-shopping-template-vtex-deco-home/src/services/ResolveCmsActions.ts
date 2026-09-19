import { openProductById, openProductBySlug, resolveNavigation } from './NavigationService'
import Eitri from 'eitri-bifrost'
import { TrackingService } from 'eitri-shopping-template-vtex-deco-shared'

interface CmsAction {
	type?: string
	value?: string
	sort?: string
	title?: string
	banner?: string
	facets?: Array<{ key: string; value: string }>
	// Breadcrumb trail (root → leaf) shown by ProductCatalog.
	categoryNames?: string[]
	[key: string]: unknown
}

interface SliderData {
	mktTag?: string
	action?: CmsAction
	[key: string]: unknown
}

// A search with facets is really a filtered catalog, so it opens ProductCatalog instead of Search.
const handleSearchAction = (action: CmsAction | string) => {
	const value = typeof action === 'string' ? action : action?.value
	const facets = typeof action === 'object' ? action?.facets : undefined
	const sort = typeof action === 'object' ? action?.sort : undefined
	const title = typeof action === 'object' ? action?.title : undefined

	if (facets?.length) {
		Eitri.navigation.navigate({
			path: 'ProductCatalog',
			state: {
				params: {
					facets,
					query: value,
					sort: sort || ''
				},
				title: title || ''
			}
		})
	} else {
		Eitri.navigation.navigate({
			path: 'Search',
			state: {
				searchTerm: value
			}
		})
	}
}
const handleCollectionAction = (action: CmsAction) => {
	const facets = [{ key: 'productClusterIds', value: action?.value ?? '' }, ...(action?.facets || [])]

	Eitri.navigation.navigate({
		path: 'ProductCatalog',
		state: {
			params: {
				facets,
				sort: action?.sort || ''
			},
			title: action?.title || '',
			banner: action?.banner || ''
		}
	})
}
const handlePageAction = (value?: string) => {
	Eitri.navigation.navigate({
		path: 'LandingPage',
		state: {
			landingPageName: value
		}
	})
}
const handleCategoryAction = (action: CmsAction) => {
	const _categories = action?.value?.split('/')
	const categories = _categories?.filter(c => !!c)

	const _categoryFacets =
		categories?.map((c, index) => {
			return {
				key: `category-${index + 1}`,
				value: c
			}
		}) || []

	const facets = [..._categoryFacets, ...(action?.facets || [])]

	const params = {
		facets: facets,
		sort: action?.sort || ''
	}
	Eitri.navigation.navigate({
		path: 'ProductCatalog',
		state: {
			params,
			title: action?.title,
			categoryNames: action?.categoryNames,
			banner: action?.banner
		}
	})
}
const handleProductAction = (value: string) => {
	if (/^\d+$/.test(value)) {
		openProductById(value)
	} else {
		openProductBySlug(value)
	}
}
const openBrand = (action: CmsAction) => {
	const facets = [{ key: 'brand', value: action?.value ?? '' }, ...(action?.facets || [])]

	Eitri.navigation.navigate({
		path: 'ProductCatalog',
		state: { params: { facets, sort: action?.sort }, title: action?.title || '' }
	})
}

const openLink = (link: string) => {
	Eitri.openBrowser({
		url: link,
		inApp: true
	})
}

const openFacets = (action: CmsAction) => {
	const facets = action?.facets || []

	Eitri.navigation.navigate({
		path: 'ProductCatalog',
		state: { params: { facets, sort: action?.sort }, title: action?.title || '' }
	})
}

export const processActions = (sliderData: SliderData): void => {
	if (sliderData.mktTag) {
		TrackingService.selectPromotionEvent({
			creative_name: sliderData.mktTag
		})
	}

	// console.log('sliderData', sliderData)

	const action = sliderData?.action
	switch (action?.type) {
		case 'search':
			handleSearchAction(action)
			break
		case 'collection':
			handleCollectionAction(action)
			break
		case 'page':
			handlePageAction(action.value)
			break
		case 'category':
			handleCategoryAction(action)
			break
		case 'product':
			if (action.value) handleProductAction(action.value)
			break
		case 'path':
			if (action.value) resolveNavigation(action.value)
			break
		case 'brand':
			openBrand(action)
			break
		case 'link':
			if (action.value) openLink(action.value)
			break
		case 'facets':
			openFacets(action)
			break;
		default:
			console.log(`Unknown action type: ${action?.type}`)
	}
}
