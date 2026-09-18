import Hero from '../sections/Banners/Hero'
import Post from '../sections/Post'
import OverHeader from '../sections/OverHeader'
import MultipleImageBanner from '../sections/Banners/MultipleImageBanner'
import BannerDuo from '../sections/Banners/BannerDuo'
import BannerTrio from '../sections/Banners/BannerTrio'
import SpotlightCarousel from '../sections/Banners/SpotlightCarousel'
import ProductShelf from '../sections/ProductShelf'
import CategoryGallery from '../sections/CategoryGallery'
import BrandCarousel from '../sections/BrandCarousel'
import CategoryListSwipe from '../sections/CategoryListSwipe'
import Experiences from '../sections/Experiences'
import NewsLetter from '../sections/NewsLetter'
import ProductTiles from '../sections/ProductTiles'
import HighlightedProductShelf from '../sections/HighlightedProductShelf'
import CategoryTree from '../sections/CategoryTree'
import CategoryAccordion from '../sections/CategoryAccordion'
import RichText from '../sections/RichText'
import VtexAdsBanner from '../sections/VtexAdsBanner'
import LastSeenProducts from '../sections/LastSeenProducts'
import BlogPostShelf from '../sections/BlogPostShelf'
import CategoryListVtex from '../sections/CategoryListVtex'
import ProductInfiniteScroll from '../sections/ProductInfiniteScroll'
import ProductList from '../sections/ProductList'
import NavigateByCategories from '../sections/NavigateByCategories'
import BannerWithShelf from '../sections/BannerWithShelf'
import VideoHero from '../sections/VideoHero'
import WelcomeModal from '../sections/WelcomeModal'
import WelcomeHeader from '../sections/AppPages/WelcomeHeader'
import WelcomeLoginOptions from '../sections/AppPages/WelcomeLoginOptions'
import AppPageLogin from '../sections/AppPages/Login'
import FavoritosHeader from '../sections/AppPages/FavoritosHeader'
import WishlistGrid from '../sections/WishlistGrid'
import AppPageSignUp from '../sections/AppPages/SignUp'
import HelpSection from '../sections/HelpSection'
import FaqSection from '../sections/FaqSection'

/**
 * Mapa manual de seções, chaveado pelo caminho inferido do `__resolveType`
 * (sem o namespace `site/sections/` e sem extensão).
 * Ao criar uma nova seção em `src/sections/`, importe-a e registre-a neste mapa.
 */
const SECTION_MAP: { [key: string]: React.ElementType } = {
	'Banners/Hero': Hero,
	'Post': Post,
	'OverHeader': OverHeader,
	'Banners/MultipleImageBanner': MultipleImageBanner,
	'Banners/BannerDuo': BannerDuo,
	'Banners/BannerTrio': BannerTrio,
	'Banners/SpotlightCarousel': SpotlightCarousel,
	'ProductShelf': ProductShelf,
	'CategoryGallery': CategoryGallery,
	'BrandCarousel': BrandCarousel,
	'CategoryListSwipe': CategoryListSwipe,
	'Experiences': Experiences,
	'NewsLetter': NewsLetter,
	'ProductTiles': ProductTiles,
	'HighlightedProductShelf': HighlightedProductShelf,
	'CategoryTree': CategoryTree,
	'CategoryAccordion': CategoryAccordion,
	'RichText': RichText,
	'VtexAdsBanner': VtexAdsBanner,
	'LastSeenProducts': LastSeenProducts,
	'BlogPostShelf': BlogPostShelf,
	// Alias: no CMS legado a seção do blog se chama "WordPressCardList".
	'WordPressCardList': BlogPostShelf,
	'CategoryListVtex': CategoryListVtex,
	'ProductInfiniteScroll': ProductInfiniteScroll,
	'ProductList': ProductList,
	'NavigateByCategories': NavigateByCategories,
	'BannerWithShelf': BannerWithShelf,
	'VideoHero': VideoHero,
	'WelcomeModal': WelcomeModal,
	'AppPages/WelcomeHeader': WelcomeHeader,
	'AppPages/WelcomeLoginOptions': WelcomeLoginOptions,
	'AppPages/Login': AppPageLogin,
	'AppPages/FavoritosHeader': FavoritosHeader,
	'WishlistGrid': WishlistGrid,
	'AppPages/SignUp': AppPageSignUp,
	'HelpSection': HelpSection,
	'FaqSection': FaqSection
}

const stripExt = (value: string) => value.replace(/\.(tsx|jsx|ts|js)$/, '')

/**
 * Infere o componente de seção a partir do `__resolveType` do deco.
 *
 * @param {string} resolveType - ex.: "site/sections/Banners/Hero.tsx"
 * @returns {React.ElementType|null} O componente da seção, ou `null` se não registrado.
 */
export default function resolveSection(resolveType: string | undefined): React.ElementType | null {
	if (!resolveType || typeof resolveType !== 'string') return null

	// Blocos de infra do Deco (flags, loaders, matchers…) não são seções renderizáveis
	if (!resolveType.startsWith('site/sections/') && !resolveType.startsWith('sections/')) {
		return null
	}

	// site/sections/Banners/Hero.tsx -> Banners/Hero
	const key = stripExt(resolveType.replace(/^site\/sections\//, '').replace(/^sections\//, ''))

	const Section = SECTION_MAP[key]

	if (!Section) {
		console.warn(`[resolveSection] Nenhum componente registrado para "${resolveType}" (chave "${key}")`)
		return null
	}

	return Section
}
