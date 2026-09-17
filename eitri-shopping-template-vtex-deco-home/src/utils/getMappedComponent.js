import Banner from '../components/CmsComponents/Banner/Banner'
import ProductShelf from '../components/CmsComponents/ProductShelf/ProductShelf'
import ProductTiles from '../components/CmsComponents/ProductTiles/ProductTiles'
import CategoryTree from '../components/CmsComponents/CategoryTree/CategoryTree'
import LastSeenProducts from '../components/CmsComponents/LastSeenProducts/LastSeenProducts'
import CategoryListSwipe from '../components/CmsComponents/CategoryListSwipe/CategoryListSwipe'
import ProductInfiniteScroll from '../components/CmsComponents/ProductInfiniteScroll/ProductInfiniteScroll'
import BlogPostShelf from '../components/CmsComponents/Blog/BlogPostShelf'
import HighlightedProductShelf from '../components/CmsComponents/HighlightedProductShelf/HighlightedProductShelf'
import CategoryListVtex from '../components/CmsComponents/CategoryListVtex/CategoryListVtex'
import CategoryAccordion from '../components/CmsComponents/CategoryAccordion/CategoryAccordion'
import RichText from '../components/CmsComponents/RichText/RichText'
import VtexAdsBanner from '../components/CmsComponents/VtexAdsBanner/VtexAdsBanner'

const componentMap = {
	MultipleImageBanner: Banner,
	ProductTiles: ProductTiles,
	ProductShelf: ProductShelf,
	CategoryTree: CategoryTree,
	LastSeenProducts: LastSeenProducts,
	CategoryListSwipe: CategoryListSwipe,
	ProductInfiniteScroll: ProductInfiniteScroll,
	WordPressCardList: BlogPostShelf,
	HighlightedProductShelf: HighlightedProductShelf,
	CategoryListVtex: CategoryListVtex,
	CategoryAccordion: CategoryAccordion,
	RichText: RichText,
	VtexAdsBanner: VtexAdsBanner
}

export const getMappedComponent = (content, reloadKey, rest) => {
	const Component = componentMap[content.name]
	if (!Component) {
		console.error(`Component ${content.name} does not exist in the component map.`)
		return null
	}

	const key = content.id

	try {
		return (
			<Component
				key={key}
				data={content.data}
				reloadKey={reloadKey}
				{...rest}
			/>
		)
	} catch (error) {
		console.error(`Error rendering component ${content.name}:`, error)
		return null
	}
}
