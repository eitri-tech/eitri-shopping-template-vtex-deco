import { getWishlist, removeFromWishlist } from '../services/CustomerService'
import WishlistItem from '../components/WishlistItem/WishlistItem'
import {
	HeaderContentWrapper,
	HeaderReturn,
	HeaderText,
	HeaderLogo,
	HeaderSearchIcon,
	Loading,
	BottomInset,
	CustomButton,
	WishlistIcon,
	useRetractableBottomBar
} from 'eitri-shopping-template-vtex-deco-shared'
import { sendScreenView } from '../services/TrackingService'
import { addonUserTappedActiveTabListener } from '../utils/backToTopListener'
import { EventBusChannels, EventBus } from 'eitri-shopping-vtex-shared'
import { useTranslation } from 'eitri-i18n'
import { openCategories, openSearch } from '../services/NavigationService'

export default function Wishlist(props) {
	const { t } = useTranslation()
	useRetractableBottomBar()
	const [wishlistItems, setWishlistItems] = useState([])
	const [isLoading, setIsLoading] = useState(true)

	const openWithBottomBart = !!props?.location?.state?.tabIndex
	const isEmpty = wishlistItems.length === 0 && !isLoading

	useEffect(() => {
		start()
		addonUserTappedActiveTabListener()
		sendScreenView('Lista de desejos', 'Wishlist')
		EventBus.subscribe({
			channel: EventBusChannels.USER_LOGGED_IN,
			broadcast: true,
			callback: data => {
				start()
			}
		})
		EventBus.subscribe({
			channel: EventBusChannels.USER_LOGGED_OUT,
			broadcast: true,
			callback: data => {
				setWishlistItems([])
			}
		})
		EventBus.subscribe({
			channel: 'addToWishlist',
			broadcast: true,
			callback: data => {
				start()
			}
		})
		EventBus.subscribe({
			channel: 'removeFromWishlist',
			broadcast: true,
			callback: data => {
				start()
			}
		})
	}, [])

	const start = async () => {
		try {
			setIsLoading(true)
			const result = await getWishlist()
			setWishlistItems(result)
			setIsLoading(false)
		} catch (e) {
			setWishlistItems([])
			setIsLoading(false)
		}
	}

	const onRemoveFromWishList = async id => {
		setIsLoading(true)
		try {
			await removeFromWishlist(id)
			setWishlistItems(prevItems => prevItems.filter(item => item.id !== id))
		} catch (error) {
			console.error(error)
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<Page title='Lista de desejos'>
			<View className='min-h-[100vh] flex flex-col'>
				<HeaderContentWrapper className='items-center'>
					{!openWithBottomBart && <HeaderReturn />}
					<View className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center'>
						{isEmpty ? (
							<HeaderLogo />
						) : (
							<>
								<HeaderText text={t('wishlist.title')} />
								{wishlistItems.length > 0 && (
									<Text className='text-sm text-gray-500'>
										{t(
											'wishlist.productsCount',
											{ count: wishlistItems.length }
										)}
									</Text>
								)}
							</>
						)}
					</View>
					<View className='ml-auto'>
						<HeaderSearchIcon onClick={openSearch} />
					</View>
				</HeaderContentWrapper>

				<Loading
					isLoading={isLoading}
					fullScreen
				/>

				<View className='grid grid-cols-2 gap-x-2 gap-y-4 p-4'>
					{wishlistItems?.map(item => (
						<WishlistItem
							key={item.id}
							productId={item.productId}
							onRemoveFromWishlist={() => onRemoveFromWishList(item.id)}
						/>
					))}
				</View>

				{isEmpty && (
					<View className='flex flex-1 flex-col justify-center items-center px-8 gap-4'>
						<WishlistIcon
							filled
							size={60}
							className='text-black'
						/>
						<Text className='font-bold text-xl text-center'>{t('wishlist.emptyTitle')}</Text>
						<Text className='text-center text-gray-600 text-sm'>{t('wishlist.emptySubtitle')}</Text>
						<CustomButton
							label={t('wishlist.discoverButton')}
							onClick={openCategories}
						/>
					</View>
				)}

				<BottomInset />
			</View>
		</Page>
	)
}
