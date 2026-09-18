import { View, Text, Image } from 'eitri-luminus'
import { useTranslation } from 'eitri-i18n'
import CustomButton from '../CustomButton/CustomButton'
import CloseIcon from '../CloseIcon/CloseIcon'

interface AddedToCartProduct {
	name?: string
	image?: string
	price?: string
	listPrice?: string
	[key: string]: unknown
}

interface AddedToCartModalProps {
	open?: boolean
	onClose?: () => void
	onGoToCart?: () => void
	product?: AddedToCartProduct | null
	[key: string]: unknown
}

export default function AddedToCartModal(props: AddedToCartModalProps) {
	const { open, onClose, onGoToCart, product } = props

	const { t } = useTranslation()

	if (!open || !product) return null

	const { name, image, price, listPrice } = product

	return (
		<View
			className='z-[9999] !bg-black/70 !opacity-100 fixed inset-0 flex items-end justify-center'
			onClick={() => {
				if (typeof onClose === 'function') onClose()
			}}>
			<View
				onClick={(e?: any) => e?.stopPropagation?.()}
				className='bg-white !rounded-t-lg w-screen max-h-[85vh] overflow-y-auto pointer-events-auto px-4 pt-5 pb-6'>
				<View className='flex items-start justify-between gap-4 mb-5'>
					<Text className='text-lg font-bold text-base-content'>{t('addedToCartModal.title', 'Produto adicionado à sacola!')}</Text>
					<View
						onClick={() => {
							if (typeof onClose === 'function') onClose()
						}}>
						<CloseIcon className='text-base-content' />
					</View>
				</View>

				<View className='flex items-start gap-4 mb-6'>
					{image && (
						<Image
							src={image}
							className='w-[100px] h-[100px] object-contain bg-base-200'
						/>
					)}
					<View className='flex flex-col flex-1 gap-2'>
						<Text className='text-sm text-base-content'>{name}</Text>
						<View className='border-t border-base-300' />
						<View className='flex items-center gap-2'>
							<Text className='text-sm font-bold text-base-content'>{price}</Text>
							{listPrice && (
								<>
									<Text className='text-sm text-base-content/40'>|</Text>
									<Text className='text-sm text-base-content/40 line-through'>{listPrice}</Text>
								</>
							)}
						</View>
					</View>
				</View>

				<CustomButton
					label={t('addedToCartModal.goToCart', 'Ver sacola')}
					borderRadius='rounded-full'
					height='h-[50px]'
					onPress={() => {
						if (typeof onGoToCart === 'function') onGoToCart()
					}}
				/>
			</View>
		</View>
	)
}
