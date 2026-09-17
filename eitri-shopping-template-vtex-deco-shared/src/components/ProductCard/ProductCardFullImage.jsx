import WishlistIcon from '../WishlistIcon/WishlistIcon'
import { Text, View, Image, Loading } from 'eitri-luminus'
import Eitri from 'eitri-bifrost'
import BadgeRender from '../BadgeRender/BadgeRender'
import ShoppingBagIcon from '../ShoppingBagIcon/ShoppingBagIcon'

const BADGE_POSITION_CLASSES = {
	'top-left': 'absolute top-[7px] left-[7px]',
	'top-right': 'absolute top-[7px] right-[7px]',
	'bottom-left': 'absolute bottom-[7px] left-[7px]',
	'bottom-right': 'absolute bottom-[7px] right-[7px]',
}

function groupBadgesByPosition(badges) {
	if (!badges?.length) return {}
	return badges.reduce((acc, badge) => {
		const pos = badge.position || 'top-left'
		if (!acc[pos]) acc[pos] = []
		acc[pos].push(badge)
		return acc
	}, {})
}

export default function ProductCardFullImage(props) {
	const {
		listPrice,
		image,
		name,
		price,
		installments,
		loadingCartOp,
		isOnWishlist,
		itemQuantity,
		badges,
		showListItem,
		showWishlist = true,
		cartIcon,
		onPressOnCard,
		onPressMainAction,
		onPressOnWishlist,
		swatches,
		imageAspectRatio,
		className
	} = props

	const [cardContainerId] = useState(() => `product-card-${Math.random().toString(36).slice(2, 11)}`)
	const [imageHeight, setImageHeight] = useState(() => {
		const [aspectWidth = 1, aspectHeight = 1] = (imageAspectRatio || '1:1').replace('x', ':').split(':').map(Number)

		return Math.round((window.innerWidth / 2) * (aspectHeight / aspectWidth))
	})
	const [imageUrl, setImageUrl] = useState(null)

	useEffect(() => {
		Eitri.environment.getRemoteConfigs().then(configs => {
			try {
				const aspectRatio = imageAspectRatio || configs.appConfigs.productCardImageAspectRatio
				if (!aspectRatio) {
					setImageUrl(image)
					return
				}

				const cardContainerElement = document.getElementById(cardContainerId)
				if (!cardContainerElement) {
					setImageUrl(image)
					return
				}

				const width = cardContainerElement.getBoundingClientRect().width

				if (!width) {
					setImageUrl(image)
					return
				}

				const [aspectWidth, aspectHeight] = aspectRatio.replace('x', ':').split(':').map(Number)
				const height = width * (aspectHeight / aspectWidth)
				const avoidResize = configs.appConfigs.productCardImageAvoidResize ?? false
				const resizedImageUrl = avoidResize
					? image
					: image?.replace(/\/ids\/(\d+)\//, `/ids/$1-${width}-${height}/`)

				setImageUrl(resizedImageUrl)
				setImageHeight(height)
			} catch (e) {
				setImageUrl(image)
			}
		})
	}, [image, imageAspectRatio])

	const _onPressOnWishlist = e => {
		e.stopPropagation()
		if (onPressOnWishlist) onPressOnWishlist()
	}

	return (
		<View
			id={cardContainerId}
			onClick={onPressOnCard}
			className={`relative bg-white shadow-sm h-full flex flex-col ${className}`}>
			<View className={`flex flex-col w-full overflow-hidden flex-1`}>
				<View
					style={{ height: `${imageHeight}px`, maxHeight: `${imageHeight}px`, minHeight: `${imageHeight}px` }}
					className={`relative flex flex-col w-full justify-center items-center overflow-hidden`}>
					{imageUrl && (
						<Image
							className={`object-cover h-full w-full`}
							src={imageUrl}
						/>
					)}

					{Object.entries(groupBadgesByPosition(badges)).map(([position, positionBadges]) => (
						<BadgeRender
							key={position}
							className={`${BADGE_POSITION_CLASSES[position]} p-2 z-10`}
							badges={positionBadges}
						/>
					))}

					{showWishlist && (
						<View
							onClick={_onPressOnWishlist}
							className='absolute top-[7px] p-2 right-[7px] flex items-center justify-center rounded-full bg-header-background z-[99]'>
							<WishlistIcon
								filled={isOnWishlist}
								size={'24'}
							/>
						</View>
					)}

					<View
						onClick={e => {
							e.stopPropagation()
							if (onPressMainAction) onPressMainAction()
						}}
						className='absolute bottom-[7px] p-2 right-[7px] flex items-center justify-center z-[99]'>
						{loadingCartOp ? (
							<Loading
								width='18px'
								className='text-primary-content'
							/>
						) : cartIcon ? (
							cartIcon
						) : (
							<ShoppingBagIcon />
						)}
					</View>
				</View>

				<View className={`w-full p-2 flex-1`}>
					<View className='mt-1 w-full flex justify-between gap-4 h-[40px] overflow-hidden'>
						<Text className='family-poppins line-clamp-2 text-sm leading-5 break-words'>{name}</Text>
					</View>

					<View className='flex flex-col gap-0'>
						<View className='h-[16px] overflow-hidden'>
							{showListItem && listPrice && (
								<Text className='family-poppins line-through text-neutral-500 text-xs leading-4 line-clamp-1'>
									{listPrice}
								</Text>
							)}
						</View>

						<View className='h-[24px] overflow-hidden'>
							<Text className='family-poppins font-bold text-primary-700 text-sm leading-6 line-clamp-1'>
								{price}
							</Text>
						</View>

						<View className='h-[16px] overflow-hidden'>
							{installments && (
								<Text className='family-poppins text-neutral-500 text-[10px] leading-4 line-clamp-1'>
									{installments}
								</Text>
							)}
						</View>

						<View className='flex flex-col'>{swatches}</View>
					</View>
				</View>
			</View>
		</View>
	)
}
