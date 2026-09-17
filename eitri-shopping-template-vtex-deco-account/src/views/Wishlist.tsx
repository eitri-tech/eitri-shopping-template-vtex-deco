import { useEffect, useState } from 'react'
import { Page, View } from 'eitri-luminus'
import { getWishlist, removeFromWishlist } from '../services/CustomerService'
import WishlistItem from '../components/WishlistItem/WishlistItem'
import { HeaderContentWrapper, HeaderReturn, HeaderText, Loading, BottomInset } from 'eitri-shopping-template-vtex-deco-shared'
import NoItem from '../components/NoItem/NoItem'
import { sendScreenView } from '../services/TrackingService'
import { addonUserTappedActiveTabListener } from '../utils/backToTopListener'
import { EventBusChannels, EventBus } from 'eitri-shopping-vtex-shared'
import { useTranslation } from 'eitri-i18n'
import type { RouteProps } from '../types/route'

interface WishlistEntry {
	id?: string
	productId?: string
	[key: string]: unknown
}

interface WishlistState {
	tabIndex?: number
}

export default function Wishlist(props: RouteProps<WishlistState>) {
	const { t } = useTranslation()
	const [wishlistItems, setWishlistItems] = useState<WishlistEntry[]>([])
	const [isLoading, setIsLoading] = useState(true)

	const openWithBottomBart = !!props?.location?.state?.tabIndex

	useEffect(() => {
		start()
		addonUserTappedActiveTabListener()
		sendScreenView('Lista de desejos', 'Wishlist')
		EventBus.subscribe({
			channel: EventBusChannels.USER_LOGGED_IN,
			broadcast: true,
			callback: () => {
				start()
			}
		})
		EventBus.subscribe({
			channel: EventBusChannels.USER_LOGGED_OUT,
			broadcast: true,
			callback: () => {
				setWishlistItems([])
			}
		})
		EventBus.subscribe({
			channel: 'addToWishlist',
			broadcast: true,
			callback: () => {
				start()
			}
		})
		EventBus.subscribe({
			channel: 'removeFromWishlist',
			broadcast: true,
			callback: () => {
				start()
			}
		})
	}, [])

	const start = async () => {
		try {
			setIsLoading(true)
			const result = (await getWishlist()) as WishlistEntry[]
			setWishlistItems(result)
			setIsLoading(false)
		} catch (e) {
			setWishlistItems([])
			setIsLoading(false)
		}
	}

	const onRemoveFromWishList = async (id?: string) => {
		if (!id) return
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
			<View className={'min-h-[100vh] flex flex-col'}>
				<HeaderContentWrapper>
					{!openWithBottomBart && <HeaderReturn />}

					<HeaderText text={t('wishlist.title')} />
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
				{wishlistItems.length === 0 && !isLoading && (
					<NoItem
						title={t('wishlist.emptyTitle')}
						subtitle={t('wishlist.emptySubtitle')}
					/>
				)}
				<BottomInset />
			</View>
		</Page>
	)
}
