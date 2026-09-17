export { default as HeaderCart } from './components/Header/HeaderCart'
export { default as HeaderLogo } from './components/Header/HeaderLogo'
export { default as HeaderMenu } from './components/Header/HeaderMenu'
export { default as HeaderSearch } from './components/Header/HeaderSearch'
export { default as HeaderReturn } from './components/Header/HeaderReturn'
export { default as HeaderClose } from './components/Header/HeaderClose'
export { default as HeaderText } from './components/Header/HeaderText'
export { default as CustomButton } from './components/CustomButton/CustomButton'
export { default as CustomInput } from './components/CustomInput/CustomInput'
export { default as CustomCheckbox } from './components/CustomCheckbox/CustomCheckbox'
export { default as HeaderContentWrapper, HEADER_VARIANT } from './components/Header/HeaderContentWrapper'
export { default as HeaderSearchIcon } from './components/Header/HeaderSearchIcon'
export { default as HeaderWishList } from './components/Header/HeaderWishList'
export { default as HeaderShare } from './components/Header/HeaderShare'

export { default as Loading } from './components/Loading/LoadingComponent'
export { default as Spacing } from './components/Spacing/Spacing'
export { default as Divisor } from './components/Divisor/Divisor'
export { default as ProductCardDefault } from './components/ProductCard/ProductCardDefault'
export { default as ProductCardFullImage } from './components/ProductCard/ProductCardFullImage'
export { default as GenericError } from './components/Error/GenericError'
export { default as cartShippingResolver } from './utils/cartShippingResolver'
export { default as shippingResolver } from './utils/shippingResolver'
export { default as productGroupShippingResolver } from './utils/productGroupShippingResolver'
export { default as TrackingService } from './services/TrackingService'
export { default as Datadog } from './services/Datadog'
export { default as NewsletterService } from './services/NewsletterService'
export { fetchClientCode } from './services/ContactLookupService'
export {
	saveContactKeyOnStorage,
	loadContactKeyFromStorage,
	clearContactKeyFromStorage,
	refreshContactKeyIfStale,
	resolveContactKey
} from './services/ContactKeyService'
export { default as BottomInset } from './components/BottomInset/BottomInset'
export { default as CustomCarousel } from './components/CustomCarousel/CustomCarousel'
export { default as LoginModal } from './components/LoginModal/LoginModal'
export { default as AddedToCartModal } from './components/AddedToCartModal/AddedToCartModal'
export * as BiometricService from './services/BiometricService'
export { default as useBiometricLogin, resetBiometricLoginAttempt } from './hooks/useBiometricLogin'
export { default as BiometricReauthModal } from './components/BiometricReauthModal/BiometricReauthModal'

export { default as Rating } from './components/ProductCard/components/Rating'
export { default as GenericBox } from './components/GenericBox/GenericBox'

export { default as Slider } from './Slider/Slider'
export { default as SkuSelector } from './components/SkuSelector/SkuSelector'
export { default as getBadgesForProducts } from './services/BadgesService'
export { default as SliderPagination } from './components/SliderPagination/SliderPagination'
export { getProductProperty, getAgrupadorCode, getMetalColor, groupSiblingsByCode } from './utils/metalSwatches'

// Providers (carrinho / snackbar) — compartilhados entre apps
export { default as CartProvider, useLocalShoppingCart } from './providers/LocalCart'
export { default as SnackBarProvider, useSnackBar } from './providers/SnackBar'

// Hooks
export { default as useRetractableBottomBar, useBottomBarVisibility, setBottomBarVisible } from './hooks/useRetractableBottomBar'
export { default as useAppPageTexts } from './hooks/useAppPageTexts'
export { default as useWishlistItems } from './hooks/useWishlistItems'
export { default as HelpSection } from './sections/HelpSection'
export { default as FaqSection } from './sections/FaqSection'

// ProductCard "inteligente" (carrinho/wishlist) + prateleira de produtos
export { default as ProductCard } from './components/ProductCard/ProductCard'
export { default as ShelfOfProducts } from './components/ShelfOfProducts/ShelfOfProducts'
export { default as SectionTitle } from './components/SectionTitle/SectionTitle'
export { default as ProductList } from './components/ProductList/ProductList'

// Serviços de storefront usados pelas seções do CMS
export { getProductsService } from './services/ProductService'
export { getCart, addItemToCart, removeCartItem, updateItemOnCart } from './services/CartService'
export {
	requestLogin,
	isLoggedIn,
	getWishlist,
	productOnWishlist,
	removeItemFromWishlist,
	addToWishlist
} from './services/CustomerService'
export { processActions } from './services/ResolveCmsActions'
export { formatPrice } from './utils/price'

// Deco sections
export { default as DecoCMSContentRender } from './components/DecoCMSContentRender/DecoCMSContentRender'

export { default as WishlistIcon } from './components/WishlistIcon/WishlistIcon'
export { default as CircularArrowIcon } from './components/CircularArrowIcon/CircularArrowIcon'
export { default as SupportIcon } from './components/SupportIcon/SupportIcon'
export { default as PaymentIcon } from './components/PaymentIcon/PaymentIcon'
export { default as GiftIcon } from './components/GiftIcon/GiftIcon'
export { default as AlertIcon } from './components/AlertIcon/AlertIcon'
export { getMaterialImage, getPedraImage, getVariationImage } from './utils/variationImages'

export { default as ChevronRightIcon } from './components/ChevronRightIcon/ChevronRightIcon'
export { default as ChevronLeftIcon } from './components/ChevronLeftIcon/ChevronLeftIcon'
export { default as StarIcon } from './components/StarIcon/StarIcon'
export { default as ShoppingBagIcon } from './components/ShoppingBagIcon/ShoppingBagIcon'
export { default as CloseIcon } from './components/CloseIcon/CloseIcon'
export { default as TrashIcon } from './components/TrashIcon/TrashIcon'
export { default as CheckIcon } from './components/CheckIcon/CheckIcon'
export { default as SearchIcon } from './components/SearchIcon/SearchIcon'
export { default as CloseCircleIcon } from './components/CloseCircleIcon/CloseCircleIcon'
export { default as MinusIcon } from './components/MinusIcon/MinusIcon'
export { default as PlusIcon } from './components/PlusIcon/PlusIcon'
export { default as ArrowDownIcon } from './components/ArrowDownIcon/ArrowDownIcon'
export { default as ArrowUpIcon } from './components/ArrowUpIcon/ArrowUpIcon'
export { default as ArrowLeftIcon } from './components/ArrowLeftIcon/ArrowLeftIcon'
export { default as ArrowRightIcon } from './components/ArrowRightIcon/ArrowRightIcon'
export { default as SlidersIcon } from './components/SlidersIcon/SlidersIcon'
export { default as CopyIcon } from './components/CopyIcon/CopyIcon'
export { default as ShareIcon } from './components/ShareIcon/ShareIcon'
export { default as ClockIcon } from './components/ClockIcon/ClockIcon'
export { default as MessageCircleIcon } from './components/MessageCircleIcon/MessageCircleIcon'
export { default as MailIcon } from './components/MailIcon/MailIcon'
export { default as LockIcon } from './components/LockIcon/LockIcon'
export { default as HelpCircleIcon } from './components/HelpCircleIcon/HelpCircleIcon'
export { default as WhatsappIcon } from './components/WhatsappIcon/WhatsappIcon'
export { default as InfoCircleIcon } from './components/InfoCircleIcon/InfoCircleIcon'
export { default as CreditCardIcon } from './components/CreditCardIcon/CreditCardIcon'
export { default as FileTextIcon } from './components/FileTextIcon/FileTextIcon'
export { default as PackageIcon } from './components/PackageIcon/PackageIcon'
export { default as TruckIcon } from './components/TruckIcon/TruckIcon'
export { default as MapPinIcon } from './components/MapPinIcon/MapPinIcon'
export { default as UserIcon } from './components/UserIcon/UserIcon'
export { default as HeartIcon } from './components/HeartIcon/HeartIcon'
export { default as LogOutIcon } from './components/LogOutIcon/LogOutIcon'
export { default as BellIcon } from './components/BellIcon/BellIcon'
export { default as HandHoldingUsdIcon } from './components/HandHoldingUsdIcon/HandHoldingUsdIcon'
export { default as QrCodeScannerIcon } from './components/QrCodeScannerIcon/QrCodeScannerIcon'
export { default as BadgePercentIcon } from './components/BadgePercentIcon/BadgePercentIcon'
export { default as TagIcon } from './components/TagIcon/TagIcon'
export { default as PercentIcon } from './components/PercentIcon/PercentIcon'
export { default as CircleDollarSignIcon } from './components/CircleDollarSignIcon/CircleDollarSignIcon'
export { default as ShoppingCartIcon } from './components/ShoppingCartIcon/ShoppingCartIcon'
export { default as TicketIcon } from './components/TicketIcon/TicketIcon'
export { default as StoreBagIcon } from './components/StoreBagIcon/StoreBagIcon'
export { default as PixIcon } from './components/PixIcon/PixIcon'

export { isAppVersionBelow, getCartTabBadgeIndex } from './utils/versionCheck'
