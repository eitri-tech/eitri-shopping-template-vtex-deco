import { View, Text } from 'eitri-luminus'
import { FiAlertTriangle } from 'react-icons/fi'
import { useTranslation } from 'eitri-i18n'
import { formatPrice } from '../../utils/utils'

/**
 * Amber warning banner: "R$ 7.702,83 expiram em 6 dias".
 */
export default function BonusExpirationAlert(props) {
	const { expiration } = props
	const { t } = useTranslation()

	if (!expiration?.amount) return null

	const expiringTitleKey =
		expiration.days === 0
			? 'bonusScreen.expiringToday'
			: expiration.days === 1
				? 'bonusScreen.expiringTomorrow'
				: 'bonusScreen.expiringTitle'

	return (
		<View className='mx-4 mt-4 rounded-lg border border-[#F2C832] bg-[#FCEFB4] px-3 py-3'>
			<View className='flex flex-row items-start gap-2'>
				<View className='pt-[1px]'>
					<FiAlertTriangle
						size={16}
						className='text-gray-900'
					/>
				</View>
				<View className='flex flex-col flex-1'>
					<Text className='text-[13px] font-semibold text-gray-900 leading-snug'>
						{t(expiringTitleKey, {
							amount: formatPrice(expiration.amount),
							days: expiration.days
						})}
					</Text>
					<Text className='text-[12px] text-gray-700 leading-snug mt-[3px]'>
						{t('bonusScreen.expiringSubtitle', { date: expiration.date })}
					</Text>
				</View>
			</View>
		</View>
	)
}
