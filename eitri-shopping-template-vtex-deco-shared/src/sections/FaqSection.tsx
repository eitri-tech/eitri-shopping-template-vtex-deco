import { useState } from 'react'
import { View, Text } from 'eitri-luminus'
import Eitri from 'eitri-bifrost'
import { FiChevronDown, FiChevronRight } from 'react-icons/fi'
import type { FaqItem } from './types'

// TODO: replace with your FAQ/help center URL
const FAQ_FALLBACK_URL = ''

/**
 * Accordion "Perguntas Frequentes". Itens com resposta expandem inline; sem
 * resposta, abrem `url` (ou o link padrão de FAQ) no navegador.
 * @title Perguntas Frequentes
 */
export interface Props {
	/**
	 * @title Título
	 */
	title?: string
	/**
	 * @title Subtítulo
	 */
	subtitle?: string
	/**
	 * @title Perguntas
	 */
	items?: FaqItem[]
}

export default function FaqSection({ title, subtitle, items = [] }: Props) {
	const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

	if (!items.length) return null

	const handlePress = (item: FaqItem, index: number) => {
		if (!item.answer) {
			Eitri.openBrowser({ url: item.url || FAQ_FALLBACK_URL, inApp: true })
			return
		}
		setExpandedIndex(expandedIndex === index ? null : index)
	}

	return (
		<View className='mt-8'>
			{(title || subtitle) && (
				<View className='flex flex-col px-4'>
					{title && <Text className='text-[18px] font-bold text-gray-900'>{title}</Text>}
					{subtitle && <Text className='text-[12px] text-gray-500 mt-[2px]'>{subtitle}</Text>}
				</View>
			)}

			<View className='mt-3 border-t border-gray-200'>
				{items.map((item, index) => {
					const isExpanded = expandedIndex === index
					return (
						<View
							key={index}
							className='border-b border-gray-200'>
							<View
								onClick={() => handlePress(item, index)}
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
