import { openProductById, openProductBySlug, resolveNavigation } from './NavigationService'
import Eitri from 'eitri-bifrost'
import TrackingService from './TrackingService'

const handleSearchAction = action => {
	const value = typeof action === 'string' ? action : action?.value
	const facets = typeof action === 'object' ? action?.facets : undefined

	if (facets?.length) {
		Eitri.navigation.navigate({
			path: 'ProductCatalog',
			state: {
				params: {
					facets,
					query: value,
					sort: action?.sort || ''
				},
				title: action?.title || ''
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
const handleCollectionAction = action => {
	const facets = [{ key: 'productClusterIds', value: action?.value }, ...(action?.facets || [])]

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
const handlePageAction = value => {
	Eitri.navigation.navigate({
		path: 'LandingPage',
		state: {
			landingPageName: value
		}
	})
}
const handleCategoryAction = action => {
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
const handleProductAction = value => {
	if (/^\d+$/.test(value)) {
		openProductById(value)
	} else {
		openProductBySlug(value)
	}
}
const openBrand = action => {
	const facets = [{ key: 'brand', value: action?.value }, ...(action?.facets || [])]

	Eitri.navigation.navigate({
		path: 'ProductCatalog',
		state: { params: { facets, sort: action?.sort }, title: action?.title || '' }
	})
}

const openLink = link => {
	Eitri.openBrowser({
		url: link,
		inApp: true
	})
}

const openFacets = action => {
	const facets = action?.facets || []

	Eitri.navigation.navigate({
		path: 'ProductCatalog',
		state: { params: { facets, sort: action?.sort }, title: action?.title || '' }
	})
}

export const processActions = sliderData => {
	if (sliderData.mktTag) {
		TrackingService.selectPromotionEvent({
			creative_name: sliderData.mktTag
		})
	}

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
			handleProductAction(action.value)
			break
		case 'path':
			resolveNavigation(action.value)
			break
		case 'brand':
			openBrand(action)
			break
		case 'link':
			openLink(action.value)
			break
		case 'facets':
			openFacets(action)
			break;
		default:
			console.log(`Unknown action type: ${action.type}`)
	}
}
