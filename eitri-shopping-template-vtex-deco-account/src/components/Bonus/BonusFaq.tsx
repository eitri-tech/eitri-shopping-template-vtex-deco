import { useState } from 'react'
import { View, Text } from 'eitri-luminus'
import { FiChevronDown, FiChevronRight } from 'react-icons/fi'
import { useTranslation } from 'eitri-i18n'
import { getBonusFaq } from '../../services/BonusService'
import type { BonusFaqItem } from '../../types/bonus'

interface BonusFaqProps {
	onSelect?: (item: BonusFaqItem) => void
	[key: string]: unknown
}

/**
 * "Perguntas Frequentes" list.
 *
 * Mirrors the /meu-bonus accordion: entries with confirmed copy expand inline,
 * entries without it fall through to `onSelect` so the caller can open the link.
 */
export default function BonusFaq(props: BonusFaqProps) {
	const { onSelect } = props
	const { t } = useTranslation()

	const [expandedId, setExpandedId] = useState<string | null>(null)

	const items = getBonusFaq()

	const handlePress = (item: BonusFaqItem) => {
		if (!item.answer) {
			if (onSelect) onSelect(item)
			return
		}
		setExpandedId(expandedId === item.id ? null : item.id)
	}

	return (
		<View className='mt-8'>
			<View className='flex flex-col px-4'>
				<Text className='text-[18px] font-bold text-gray-900'>{t('bonusScreen.faqTitle')}</Text>
				<Text className='text-[12px] text-gray-500 mt-[2px]'>{t('bonusScreen.faqSubtitle')}</Text>
			</View>

			<View className='mt-3 border-t border-gray-200'>
				{items.map(item => {
					const isExpanded = expandedId === item.id
					return (
						<View
							key={item.id}
							className='border-b border-gray-200'>
							<View
								onClick={() => handlePress(item)}
								className='flex flex-row items-center justify-between gap-3 px-4 py-4'>
								<Text className='text-[13px] text-gray-800 flex-1'>{item.question}</Text>
								{isExpanded ? (
									<FiChevronDown
										size={18}
										className='text-gray-400'
									/>
								) : (
									<FiChevronRight
										size={18}
										className='text-gray-400'
									/>
								)}
							</View>

							{isExpanded && item.answer && (
								<View className='px-4 pb-4 -mt-1'>
									<Text className='text-[12px] text-gray-600 leading-relaxed'>{item.answer}</Text>
								</View>
							)}
						</View>
					)
				})}
			</View>
		</View>
	)
}
