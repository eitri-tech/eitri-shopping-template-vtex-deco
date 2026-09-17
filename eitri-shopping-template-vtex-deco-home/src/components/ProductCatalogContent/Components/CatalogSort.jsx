import { useState } from 'react'
import { View, Text } from 'eitri-luminus'
import { useTranslation } from 'eitri-i18n'
import { LIST_ORDERING } from '../../../utils/lists'
import { CustomButton } from 'eitri-shopping-template-vtex-deco-shared'
import CustomModal from '../../CustomModal/CustomModal'

export default function CatalogSort(props) {
	const { currentSort, onSortChange } = props

	const [showModal, setShowModal] = useState(false)

	const { t } = useTranslation()

	const handleSortSelect = sortValue => {
		onSortChange(sortValue)
		setShowModal(false)
	}

	const getCurrentSortLabel = () => {
		const currentOption = LIST_ORDERING.values.find(option => option.value === currentSort)
		return currentOption ? t(currentOption.name) : t('lists.labelRelevance')
	}

	const isCurrentSort = sortOption => {
		return currentSort === sortOption.value || currentSort === sortOption.id
	}

	return (
		<>
			<CustomButton
				onClick={() => setShowModal(true)}
				outlined
				leftIcon={
					<svg
						xmlns='http://www.w3.org/2000/svg'
						width='16'
						height='16'
						viewBox='0 0 24 24'
						fill='none'
						stroke='currentColor'
						strokeWidth='2'
						strokeLinecap='round'
						strokeLinejoin='round'>
						<path d='M3 6h18' />
						<path d='M7 12h10' />
						<path d='M10 18h4' />
					</svg>
				}
				label={getCurrentSortLabel()}
			/>

			<CustomModal
				open={showModal}
				onClose={() => setShowModal(false)}>
				<View
					bottomInset={'auto'}
					className='bg-white rounded-t w-full max-h-[70vh] overflow-y-auto pointer-events-auto p-4'>
					<Text className='text-lg font-semibold'>{t('lists.title')}</Text>

					<View className='flex flex-col mt-4'>
						{LIST_ORDERING.values.map((option, index) => (
							<View
								key={option.value}
								onClick={() => handleSortSelect(option.value)}
								className={`flex flex-row items-center justify-between p-4 cursor-pointer transition-colors ${
									isCurrentSort(option)
										? 'bg-primary/10 border-l-4 border-primary'
										: 'border-l-4 border-transparent'
								}`}>
								<Text
									className={`text-base ${
										isCurrentSort(option) ? 'text-primary font-medium' : 'text-gray-700'
									}`}>
									{t(option.name)}
								</Text>
								{isCurrentSort(option) && (
									<svg
										xmlns='http://www.w3.org/2000/svg'
										width='20'
										height='20'
										viewBox='0 0 24 24'
										fill='none'
										stroke='currentColor'
										strokeWidth='2'
										strokeLinecap='round'
										strokeLinejoin='round'
										className='text-primary'>
										<polyline points='20,6 9,17 4,12' />
									</svg>
								)}
							</View>
						))}
					</View>

					<View className='mb-4'>
						<CustomButton
							label='Cancelar'
							onClick={() => setShowModal(false)}
						/>
					</View>
				</View>
			</CustomModal>
		</>
	)
}
