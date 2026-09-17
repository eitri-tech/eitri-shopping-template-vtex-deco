import WishlistIcon from '../WishlistIcon/WishlistIcon'
import { Text, View, Image, Loading } from 'eitri-luminus'
import Eitri from 'eitri-bifrost'
import BadgeRender from '../BadgeRender/BadgeRender'
import { IoBagAddOutline } from 'react-icons/io5'

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
		onPressOnCard,
		onPressMainAction,
		onPressOnWishlist,
		className
	} = props

	const [cardContainerId] = useState(() => `product-card-${Math.random().toString(36).slice(2, 11)}`)
	const [imageHeight, setImageHeight] = useState(180)
	const [imageUrl, setImageUrl] = useState(null)

	useEffect(() => {
		Eitri.environment.getRemoteConfigs().then(configs => {
			try {
				const aspectRatio = configs.appConfigs.productCardImageAspectRatio

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
	}, [image])

	const _onPressOnWishlist = e => {
		e.stopPropagation()
		if (onPressOnWishlist) onPressOnWishlist()
	}

	return (
		<View
			onClick={onPressOnCard}
			className={`relative bg-white rounded-lg ${className}`}>
			<View className={`flex flex-col w-full shadow-md rounded`}>
				<View
					style={{ height: `${imageHeight}px`, maxHeight: `${imageHeight}px`, minHeight: `${imageHeight}px` }}
					className={`relative flex flex-col w-full justify-center items-center rounded-t-lg`}>
					{imageUrl && (
						<Image
							className={`object-contain h-full w-full rounded-t-lg`}
							src={imageUrl}
						/>
					)}

					<BadgeRender
						className={`absolute top-[7px] p-2 left-[7px] z-10`}
						badges={badges}
					/>

					<View
						onClick={_onPressOnWishlist}
						className='absolute top-[7px] p-2 right-[7px] flex items-center justify-center rounded-full backdrop-blur-sm bg-header-background z-[99] '>
						<WishlistIcon
							filled={isOnWishlist}
							size={'20'}
						/>
					</View>

					<View
						onClick={e => {
							e.stopPropagation()
							if (onPressMainAction) onPressMainAction()
						}}
						className='absolute bottom-[7px] right-[7px] w-8 h-8 rounded-full bg-primary flex items-center justify-center z-[99]'>
						{loadingCartOp ? (
							<Loading
								width='18px'
								className='text-primary-content'
							/>
						) : itemQuantity > 0 ? (
							<Text className='text-primary-content font-bold text-xs'>{itemQuantity}</Text>
						) : (
							<IoBagAddOutline
								className='text-primary-content'
								size={16}
							/>
						)}
					</View>
				</View>

				<View className={`w-full p-2`}>
					<View className='mt-2 w-full flex justify-between gap-4 h-[40px]'>
						<Text className='line-clamp-2 font-medium text-sm break-words'>{name}</Text>
					</View>

					<View className='flex flex-col gap-2 mt-1'>
						{showListItem && (
							<>
								{listPrice ? (
									<Text className='line-through font-bold text-neutral-500 text-xs'>{listPrice}</Text>
								) : (
									<View className='h-[16px]' />
								)}
							</>
						)}

						<Text className='font-bold text-primary-700 text'>{price}</Text>

						{installments ? (
							<Text className='font-bold text-neutral-500 text-xs'>{installments}</Text>
						) : (
							<View className='h-[16px]' />
						)}
					</View>
				</View>
			</View>
		</View>
	)
}
