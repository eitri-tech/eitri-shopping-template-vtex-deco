import { GenericBox, CustomButton } from 'eitri-shopping-template-vtex-deco-shared'
import { FiEdit2, FiPackage } from 'react-icons/fi'
import { useTranslation } from 'eitri-i18n'
import formatDateMMDDYYYY from '../../utils/utils'
import { frequencyLabel, subscriptionTitle } from '../../utils/subscription'
import { navigate, PAGES } from '../../services/NavigationService'

export default function SubscriptionCard(props) {
	const { subscription, products, onRename } = props
	const { t } = useTranslation()

	const firstImage = subscription.items.map(item => products?.[item.skuId]?.imageUrl).find(Boolean)
	const extraItems = subscription.items.length - 1

	return (
		<GenericBox className='flex flex-col gap-4'>
			<View className='flex flex-row gap-4'>
				<View className='relative w-[80px] h-[80px] shrink-0 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden'>
					{firstImage ? (
						<Image
							src={firstImage}
							className='max-w-full max-h-full'
						/>
					) : (
						<FiPackage
							size={28}
							className='text-gray-400'
						/>
					)}
					{extraItems > 0 && (
						<View className='absolute bottom-1 right-1 bg-primary rounded-full px-1.5 py-1 text-[10px] font-bold text-primary-content'>
							+{extraItems}
						</View>
					)}
				</View>

				<View className='flex flex-col flex-1 gap-1'>
					<View
						className='flex flex-row items-start gap-2'
						onClick={onRename}>
						<Text className='font-bold text-gray-900 flex-1'>
							{subscriptionTitle(subscription, products, t)}
						</Text>
						<FiEdit2
							size={14}
							className='text-primary mt-1 shrink-0'
						/>
					</View>
					<Text className='text-sm text-gray-800'>{frequencyLabel(subscription.plan?.frequency)}</Text>
					<Text className='text-xs text-gray-500'>
						{t('subscriptions.nextOrder', {
							date: formatDateMMDDYYYY(subscription.nextPurchaseDate),
							interpolation: { escapeValue: false }
						})}
					</Text>
				</View>
			</View>

			<CustomButton
				variant='outlined'
				label={t('subscriptions.viewDetails')}
				onPress={() => navigate(PAGES.SUBSCRIPTION_DETAILS, { subscriptionId: subscription.id })}
			/>
		</GenericBox>
	)
}
