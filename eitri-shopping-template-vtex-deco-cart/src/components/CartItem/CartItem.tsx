import { useEffect, useState } from 'react'
import { View, Text, Image, Loading, Toggle } from 'eitri-luminus'
import Quantity from '../Quantity/Quantity'
import { HeaderWishList, GenericBox } from 'eitri-shopping-template-vtex-deco-shared'
import { addToWishlist, checkWishlistItem, removeItemFromWishlist } from '../../services/customerService'
import ModalConfirm from '../ModalConfirm/ModalConfirm'
import { useTranslation } from 'eitri-i18n'
import { formatAmountInCents } from '../../utils/utils'
import { IoCloseSharp } from 'react-icons/io5'
import { openProduct } from '../../services/navigationService'
import type { VtexCartItem, VtexMessage } from '../../types/vtex'

interface CartItemProps {
	item: VtexCartItem
	onChangeQuantityItem: (newQuantity: number) => Promise<void>
	message?: VtexMessage | null
	handleRemoveCartItem: () => void
	onAddOfferingToCart: (offeringId: string) => void
	onRemoveOfferingFromCart: (offeringId: string) => void
}

export default function CartItem(props: CartItemProps) {
	const { item, onChangeQuantityItem, message, handleRemoveCartItem, onAddOfferingToCart, onRemoveOfferingFromCart } =
		props
	const { t } = useTranslation()

	const [wishlistId, setWishlistId] = useState<string | boolean>('')
	const [showModalRemoveItem, setShowModalRemoveItem] = useState(false)
	const [modalRemoveItemText, setModalRemoveItemText] = useState('')
	const [loadingItemQuantity, setLoadingItemQuantity] = useState(false)

	// imageUrl can be missing on legacy cart items — fall back to empty rather than crashing
	// the whole cart on a bare .replace() call.
	const resizedImageUrl = (item.imageUrl ?? '').replace(/\/(\d+)-\d+-\d+\//, '/$1-200-auto/')

	useEffect(() => {
		checkWishlist()
	}, [])

	const checkWishlist = async () => {
		if (!item.productId) return
		const { inList, listId } = await checkWishlistItem(item.productId)
		if (inList) {
			setWishlistId(listId ?? '')
		}
	}

	const handleSaveFavorite = async () => {
		const wishlistIdStatus = wishlistId

		try {
			if (wishlistId && typeof wishlistId === 'string') {
				setWishlistId('')
				await removeItemFromWishlist(wishlistId)
			} else if (!wishlistId && item.productId) {
				setWishlistId(true)
				const result = await addToWishlist(item.productId, item.name ?? '', item.id ?? '')
				setWishlistId(result?.data?.addToList ?? '')
			}
		} catch (e) {
			setWishlistId(wishlistIdStatus)
		}
	}

	const handleQuantityOfItemsCart = async (quantityToUpdate: number) => {
		try {
			setLoadingItemQuantity(true)
			await onChangeQuantityItem(item.quantity + quantityToUpdate)
			setLoadingItemQuantity(false)
		} catch (e) {
			setLoadingItemQuantity(false)
		}
	}

	const handleRemoveCartItemIntention = () => {
		setModalRemoveItemText(t('cartItem.txtRemoveCartItem', { name: item.name }))
		setShowModalRemoveItem(true)
	}

	const removeCartItem = () => {
		handleRemoveCartItem()
		setShowModalRemoveItem(false)
	}

	const handleItemOffer = (offeringId: string) => {
		if (offerIsBundled(offeringId)) {
			onRemoveOfferingFromCart(offeringId)
			return
		}
		onAddOfferingToCart(offeringId)
	}

	const offerIsBundled = (offeringId: string) => {
		return item?.bundleItems?.some(o => o.id === offeringId)
	}

	const goToProduct = () => {
		if (!item.productId) return
		openProduct(item.productId)
	}

	return (
		<View>
			<GenericBox className='p-4'>
				<View className='flex gap-4'>
					<View
						className='flex-shrink-0'
						onClick={goToProduct}>
						<Image
							className='w-20 object-cover'
							src={resizedImageUrl}
						/>
					</View>

					<View className='flex-1 min-w-0'>
						{item.availability !== 'available' && (
							<View className='mb-2 p-2 bg-red-50 border border-red-200 rounded'>
								<Text className='text-sm text-red-600 font-medium'>
									{item.availability === 'cannotBeDelivered'
										? t('cartItem.cannotBeDelivered')
										: t('cartItem.notAvailable')}
								</Text>
							</View>
						)}

						<View
							className='flex justify-between items-start mb-2'
							onClick={goToProduct}>
							<Text className='text-sm font-medium text-gray-900 pr-2'>{item.name}</Text>
						</View>

						{/* Preço */}
						<View className='mb-3'>
							<Text className='text-lg font-bold text-gray-900'>
								{formatAmountInCents(item?.priceDefinition?.total)}
							</Text>
						</View>

						{/* Seletor de Quantidade */}
						<View className='flex items-center gap-2 justify-between'>
							<View className='flex items-center gap-2'>
								{loadingItemQuantity ? (
									<View className='w-[101px] h-[37px] flex justify-center items-center'>
										<Loading />
									</View>
								) : (
									<Quantity
										quantity={item.quantity}
										handleItemQuantity={handleQuantityOfItemsCart}
									/>
								)}

								<HeaderWishList
									onClick={handleSaveFavorite}
									filled={!!wishlistId}
								/>
							</View>

							<View onClick={handleRemoveCartItemIntention}>
								<IoCloseSharp className={'text-primary text-2xl'} />
							</View>
						</View>
					</View>
				</View>

				{(item?.offerings?.length ?? 0) > 0 && !message && (
					<View className='mt-4 pt-3 border-t border-gray-300'>
						{item?.offerings?.map(offering => (
							<View
								key={offering.id}
								onClick={() => handleItemOffer(offering.id)}
								className='flex items-top justify-between gap-4'>
								<View className='flex items-top gap-3'>
									<Toggle
										defaultChecked={offerIsBundled(offering.id)}
										name='terms'
										value={1}
									/>
									<View>
										<Text className='text-sm text-gray-700'>{offering?.name}</Text>
									</View>
								</View>
								<Text className='text-sm font-medium text-gray-900'>
									{offering?.price ? formatAmountInCents(offering.price) : ''}
								</Text>
							</View>
						))}
					</View>
				)}

				{/*{message && (*/}
				{/*	<View className='flex flex-col justify-center items-center'>*/}
				{/*		<View className={'h-[10px]'} />*/}
				{/*		<Text className='text-center text-tertiary-500'>*/}
				{/*			{message.text || t('cartItem.txtMessageUnavailable')}*/}
				{/*		</Text>*/}
				{/*		<View className={'h-[10px]'} />*/}
				{/*	</View>*/}
				{/*)}*/}
			</GenericBox>

			<ModalConfirm
				text={modalRemoveItemText}
				showModal={showModalRemoveItem}
				closeModal={() => setShowModalRemoveItem(false)}
				removeItem={removeCartItem}
			/>
		</View>
	)
}
