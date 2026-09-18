import { View, Text } from 'eitri-luminus'
import { FiAlertTriangle, FiGift, FiCalendar, FiAward } from 'react-icons/fi'
import { MdAutoAwesome } from 'react-icons/md'
import { useTranslation } from 'eitri-i18n'
import { formatSignedPrice } from '../../utils/utils'
import { MOVEMENT_STATUS, MOVEMENT_TYPE } from '../../services/BonusService'

const TYPE_LABEL_KEY = {
	[MOVEMENT_TYPE.RECEIVED]: 'bonusScreen.movementReceived',
	[MOVEMENT_TYPE.REDEEMED]: 'bonusScreen.movementRedeemed',
	[MOVEMENT_TYPE.SPECIAL]: 'bonusScreen.movementSpecial'
}

const BADGE_BY_STATUS = {
	[MOVEMENT_STATUS.EXPIRING]: { labelKey: 'bonusScreen.badgeExpiring', className: 'bg-[#F2C832] text-black' },
	[MOVEMENT_STATUS.EXPIRED]: { labelKey: 'bonusScreen.badgeExpired', className: 'bg-[#C8102E] text-white' },
	[MOVEMENT_STATUS.PENDING]: { labelKey: 'bonusScreen.badgePending', className: 'bg-gray-200 text-gray-700' }
}

const renderIcon = (movement, className) => {
	const size = 18
	if (movement.status === MOVEMENT_STATUS.EXPIRING)
		return (
			<FiAlertTriangle
				size={size}
				className={className}
			/>
		)
	if (movement.status === MOVEMENT_STATUS.EXPIRED)
		return (
			<FiCalendar
				size={size}
				className={className}
			/>
		)
	if (movement.type === MOVEMENT_TYPE.REDEEMED)
		return (
			<FiGift
				size={size}
				className={className}
			/>
		)
	if (movement.type === MOVEMENT_TYPE.SPECIAL)
		return (
			<FiAward
				size={size}
				className={className}
			/>
		)
	return (
		<MdAutoAwesome
			size={size}
			className={className}
		/>
	)
}

/**
 * One row of the bonus statement ("extrato").
 * Expired movements are rendered muted, keeping only the badge at full contrast.
 */
export default function BonusStatementItem(props) {
	const { movement } = props
	const { t } = useTranslation()

	const isExpired = movement.status === MOVEMENT_STATUS.EXPIRED
	const isExpiring = movement.status === MOVEMENT_STATUS.EXPIRING
	const badge = BADGE_BY_STATUS[movement.status]

	const titleColor = isExpired ? 'text-gray-400' : 'text-gray-900'
	const mutedColor = isExpired ? 'text-gray-400' : 'text-gray-500'
	const borderColor = isExpiring ? 'border-[#F2C832]' : 'border-gray-200'

	return (
		<View className={`mx-4 mt-2 rounded-lg border bg-white px-3 py-3 ${borderColor}`}>
			<View className='flex flex-row items-start gap-3'>
				<View className='pt-[1px]'>{renderIcon(movement, isExpired ? 'text-gray-400' : 'text-gray-900')}</View>

				{/* Left column is always 3 lines, which is what keeps every card the same height */}
				<View className='flex flex-col flex-1'>
					<Text className={`text-[13px] font-semibold leading-snug ${titleColor}`}>
						{t(TYPE_LABEL_KEY[movement.type] || TYPE_LABEL_KEY[MOVEMENT_TYPE.RECEIVED])}
					</Text>
					<Text className={`text-[11px] leading-snug mt-[3px] ${mutedColor}`}>{movement.description}</Text>
					<Text className={`text-[11px] leading-snug mt-[3px] ${mutedColor}`}>{movement.date}</Text>
				</View>

				<View className='flex flex-col items-end gap-[6px]'>
					<Text className={`text-[13px] font-bold whitespace-nowrap leading-snug ${titleColor}`}>
						{formatSignedPrice(movement.amount)}
					</Text>
					{badge && (
						<View className={`rounded px-2 py-[3px] ${badge.className}`}>
							<Text className='text-[10px] font-semibold whitespace-nowrap'>{t(badge.labelKey)}</Text>
						</View>
					)}
				</View>
			</View>
		</View>
	)
}
