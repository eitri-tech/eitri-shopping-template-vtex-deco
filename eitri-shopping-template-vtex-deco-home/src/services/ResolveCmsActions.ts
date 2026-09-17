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
	[key: string]: unknown
}

interface SliderData {
	mktTag?: string
	action?: CmsAction
	[key: string]: unknown
}

const handleSearchAction = (value?: string) => {
	Eitri.navigation.navigate({
		path: 'Search',
		state: {
			searchTerm: value
		}
	})
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
		state: { params, title: action?.title, banner: action?.banner }
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

	console.log('sliderData', sliderData)

	const action = sliderData?.action
	switch (action?.type) {
		case 'search':
			handleSearchAction(action.value)
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
		default:
			console.log(`Unknown action type: ${action?.type}`)
	}
}
