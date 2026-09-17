import { View, Text } from 'eitri-luminus'
import { FiArrowRight, FiInfo } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import { useTranslation } from 'eitri-i18n'

/**
 * "Precisa de ajuda?" rows shown on the empty bonus state.
 */
export default function BonusHelpSection(props) {
	const { onWhatsapp, onFaq } = props
	const { t } = useTranslation()

	const rows = [
		{ id: 'whatsapp', label: t('bonusScreen.helpWhatsapp'), icon: FaWhatsapp, onClick: onWhatsapp },
		{ id: 'faq', label: t('bonusScreen.helpFaq'), icon: FiInfo, onClick: onFaq }
	]

	return (
		<View className='mt-12'>
			<View className='px-4'>
				<Text className='text-[14px] font-bold text-gray-900'>{t('bonusScreen.helpTitle')}</Text>
			</View>

			<View className='mt-2 border-t border-gray-200'>
				{rows.map(row => {
					const Icon = row.icon
					return (
						<View
							key={row.id}
							onClick={row.onClick}
							className='flex flex-row items-center justify-between gap-3 px-4 py-4 border-b border-gray-200'>
							<View className='flex flex-row items-center gap-3 flex-1'>
								<Icon
									size={18}
									className='text-gray-900'
								/>
								<Text className='text-[13px] text-gray-800'>{row.label}</Text>
							</View>
							<FiArrowRight
								size={16}
								className='text-gray-500'
							/>
						</View>
					)
				})}
			</View>
		</View>
	)
}
