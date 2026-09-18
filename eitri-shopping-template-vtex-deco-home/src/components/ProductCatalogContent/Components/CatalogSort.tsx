import { useState } from 'react'
import { View, Text } from 'eitri-luminus'
import { useTranslation } from 'eitri-i18n'
import { LIST_ORDERING } from '../../../utils/lists'
import { CustomButton } from 'eitri-shopping-template-vtex-deco-shared'
import { LuArrowUpDown } from 'react-icons/lu'
import CustomModal from '../../CustomModal/CustomModal'

interface SortOption {
	id?: string
	categoryKey?: string
	name: string
	value: string
}

interface CatalogSortProps {
	currentSort?: string
	onSortChange?: (sortValue: string) => void
	// Sort option values/ids to hide (remote config appConfigs.home.hiddenCategorySortOptions).
	hiddenSortOptions?: string[]
}

export default function CatalogSort(props: CatalogSortProps) {
	const { currentSort, onSortChange, hiddenSortOptions = [] } = props

	const [showModal, setShowModal] = useState(false)

	const { t } = useTranslation()

	const handleSortSelect = (sortValue: string) => {
		onSortChange?.(sortValue)
		setShowModal(false)
	}

	const isCurrentSort = (sortOption: SortOption) => {
		return currentSort === sortOption.value || currentSort === sortOption.id
	}

	const visibleSortOptions = LIST_ORDERING.values.filter(
		option => !hiddenSortOptions.includes(option.value) && !(option.id && hiddenSortOptions.includes(option.id))
	)

	return (
		<>
			<View
				onClick={() => setShowModal(true)}
				className='h-[46px] w-full flex items-center justify-center gap-3 bg-[#E8E6DF]'>
				<Text className='text-lg font-normal text-black'>{t('lists.controlLabel')}</Text>
				<LuArrowUpDown size={22}/>
			</View>

			<CustomModal
				open={showModal}
				onClose={() => setShowModal(false)}>
				<View
					bottomInset={'auto'}
					className='bg-white rounded-t w-full max-h-[70vh] overflow-y-auto pointer-events-auto p-4'>
					<Text className='text-lg font-semibold'>{t('lists.title')}</Text>

					<View className='flex flex-col mt-4'>
						{visibleSortOptions.map(option => (
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
