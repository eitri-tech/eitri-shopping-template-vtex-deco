import { View, Text } from 'eitri-luminus'
import { useTranslation } from 'eitri-i18n'
import { STATEMENT_FILTER } from '../../services/BonusService'

/**
 * Segmented filter pills: Tudo / Pendente / A expirar.
 */
export default function BonusFilters(props) {
	const { value, onChange } = props
	const { t } = useTranslation()

	const options = [
		{ id: STATEMENT_FILTER.ALL, label: t('bonusScreen.filterAll') },
		{ id: STATEMENT_FILTER.PENDING, label: t('bonusScreen.filterPending') },
		{ id: STATEMENT_FILTER.EXPIRING, label: t('bonusScreen.filterExpiring') }
	]

	return (
		<View className='flex flex-row gap-2 px-4 mt-3'>
			{options.map(option => {
				const isActive = option.id === value
				return (
					<View
						key={option.id}
						onClick={() => onChange(option.id)}
						className={`flex-1 flex items-center justify-center h-[38px] rounded-md border ${
							isActive ? 'bg-black border-black' : 'bg-white border-gray-300'
						}`}>
						<Text className={`text-[13px] ${isActive ? 'text-white font-semibold' : 'text-gray-800'}`}>
							{option.label}
						</Text>
					</View>
				)
			})}
		</View>
	)
}
