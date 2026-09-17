import { useEffect, useState } from 'react'
import { View, Text } from 'eitri-luminus'
import { useTranslation } from 'eitri-i18n'
import { RemoteConfig } from 'eitri-shopping-vtex-shared'
import { getProductsFacetsService } from '../../../services/ProductService'
import CustomButton from '../../CustomButton/CustomButton'
import BottomInset from '../../BottomInset/BottomInset'
import CustomCheckbox from '../../CustomCheckbox/CustomCheckbox'
import CustomModal from '../../CustomModal/CustomModal'
import SlidersIcon from '../../SlidersIcon/SlidersIcon'
import PriceRange from './PriceRange'

export interface Props {
	currentFilters: any
	onFilterChange: (filters: any) => void
	onFilterClear: () => void
	minPriceRange: any
	setMinPriceRange: (v: any) => void
	maxPriceRange: any
	setMaxPriceRange: (v: any) => void
}

export default function CatalogFilter({
	currentFilters,
	onFilterChange,
	onFilterClear,
	minPriceRange,
	setMinPriceRange,
	maxPriceRange,
	setMaxPriceRange
}: Props) {
	// Reaproveita appConfigs.pdp.hiddenProperties (já configurada no Remote Config real) em vez de criar a chave
	// appConfigs.productCatalog.hiddenFilters documentada em docs/remoteConfig.md, para não depender de uma nova
	// configuração ser cadastrada antes do deploy
	const hiddenFiltersConfig = RemoteConfig.getContent('appConfigs.pdp.hiddenProperties')
	const hiddenFacetNames: string[] = (Array.isArray(hiddenFiltersConfig) ? hiddenFiltersConfig : []).map(
		(name: string) => name.toLowerCase()
	)

	const [showModal, setShowModal] = useState(false)
	const [tempFilters, setTempFilters] = useState<any>(currentFilters)
	const [filterFacets, setFilterFacets] = useState<any[]>([])
	const [facetsLoading, setFacetsLoading] = useState(false)

	const [currentPriceRange, setCurrentPriceRange] = useState('')
	const [initialMaxPriceRange, setInitialMaxPriceRange] = useState<any>(null)
	const [initialMinPriceRange, setInitialMinPriceRange] = useState<any>(null)

	const { t } = useTranslation()

	useEffect(() => {
		loadFacetsOptions(currentFilters)
		resolvePriceRangeCurrentFacet(currentFilters)
	}, [])

	const loadFacetsOptions = async (selectedFacets: any) => {
		try {
			setFacetsLoading(true)
			const result = await getProductsFacetsService(selectedFacets)

			if (!result || !result.facets || !Array.isArray(result.facets)) {
				setFacetsLoading(false)
				return
			}

			const priceFacet = result.facets.find((f: any) => f.type === 'PRICERANGE')
			const filteredFacets = result.facets.filter(
				(f: any) => f.type !== 'PRICERANGE' && !f.hidden && !hiddenFacetNames.includes(f.name?.toLowerCase())
			)

			const FACET_NAME_VALUES: Record<string, string> = {
				sellerName: 'Vendido por'
			}

			const VALUE_NAME_VALUES: Record<string, string> = {}

			const treatedFacets = filteredFacets.map((facet: any) => {
				return {
					...facet,
					name: FACET_NAME_VALUES[facet.name] || facet.name,
					values: facet.values.map((value: any) => {
						return {
							...value,
							name: VALUE_NAME_VALUES[value.name] || value.name
						}
					})
				}
			})

			resolvePriceRangeReceivedFacet(priceFacet)

			setFilterFacets(treatedFacets || [])
			setFacetsLoading(false)
		} catch (e) {
			console.error('Erro ao buscar facets', e)
			setFacetsLoading(false)
		}
	}

	const resolvePriceRangeReceivedFacet = (priceRangeFacet: any) => {
		if (minPriceRange && maxPriceRange) {
			return
		}

		if (!priceRangeFacet || !priceRangeFacet.values || !Array.isArray(priceRangeFacet.values)) {
			return
		}

		let min = Infinity
		let max = 0

		priceRangeFacet.values.forEach((value: any) => {
			if (value.range.from < min) {
				min = value.range.from
			}
			if (value.range.to > max) {
				max = value.range.to
			}
		})

		setMaxPriceRange(max)
		setMinPriceRange(min)
	}

	const resolvePriceRangeCurrentFacet = (filters: any) => {
		const priceRangeFacet = filters?.facets?.find((f: any) => f.key === 'price')

		if (priceRangeFacet) {
			const [min, max] = priceRangeFacet.value.split(':')
			setInitialMinPriceRange(Number(min))
			setInitialMaxPriceRange(Number(max))
		}
	}

	const handleFilterToggle = (filterValue: any, e: any) => {
		e.stopPropagation()
		const existingIndex = tempFilters?.facets?.findIndex(
			(f: any) => f.key === filterValue.key && f.value === filterValue.value
		)
		let newFacets
		if (existingIndex !== -1 && existingIndex !== undefined) {
			newFacets = tempFilters.facets.filter(
				(f: any) => !(f.key === filterValue.key && f.value === filterValue.value)
			)
		} else {
			newFacets = [...(tempFilters?.facets || []), { key: filterValue.key, value: filterValue.value }]
		}
		setTempFilters({
			...tempFilters,
			facets: newFacets
		})
		loadFacetsOptions({
			...tempFilters,
			facets: newFacets
		})
	}

	const onApplyFilters = () => {
		if (currentPriceRange) {
			const updatedFacets = [
				...(tempFilters?.facets || []).filter((f: any) => f.key !== 'price'),
				{ key: 'price', value: currentPriceRange }
			]

			const updatedFilters = {
				...tempFilters,
				facets: updatedFacets
			}

			setTempFilters(updatedFilters)
			onFilterChange(updatedFilters)
		} else {
			onFilterChange(tempFilters)
		}

		setShowModal(false)
	}

	return (
		<>
			<View
				onClick={() => !facetsLoading && setShowModal(true)}
				className={`h-[46px] w-full flex items-center justify-center gap-3 bg-[#E8E6DF] ${
					facetsLoading ? 'opacity-40' : ''
				}`}>
				<SlidersIcon
					size={24}
					className='text-black'
				/>
				<Text className='text-lg font-normal text-black'>{t('categoryPageModal.title')}</Text>
			</View>

			{showModal && (
				<CustomModal
					open={showModal}
					onClose={() => setShowModal(false)}>
					<View
						onClick={(e: any) => e.stopPropagation()}
						className='bg-white rounded-t w-full max-h-[70vh] overflow-y-auto pointer-events-auto p-4'>
						<View className='flex flex-row items-center justify-between border-b border-gray-300'>
							<Text className='text-xl font-semibold'>{t('categoryPageModal.title')}</Text>
						</View>

						<View className='flex flex-col gap-4 mt-4'>
							<PriceRange
								initialMin={initialMinPriceRange || minPriceRange}
								initialMax={initialMaxPriceRange || maxPriceRange}
								rangeMin={minPriceRange}
								rangeMax={maxPriceRange}
								step={1}
								onChange={range => setCurrentPriceRange(range)}
							/>
							{filterFacets.map((facet: any) => (
								<View
									key={facet.key}
									className='flex flex-col gap-4 border-t pt-2 border-gray-300'>
									<Text className='text-base font-bold text-gray-800'>{facet.name}</Text>
									<View className='flex flex-col gap-4 mt-1'>
										{facet.values.map((value: any, index: number) => (
											<View
												key={`${facet.key}-${index}`}
												onClick={(e: any) => handleFilterToggle(value, e)}>
												<CustomCheckbox
													checked={value.selected}
													label={`${value.name} (${value.quantity})`}
												/>
											</View>
										))}
									</View>
								</View>
							))}
						</View>

						<View className='p-4 w-full bg-white border-t border-gray-200 fixed left-0 bottom-0'>
							<View className='flex flex-row justify-between w-full gap-4 '>
								<View className='w-1/2'>
									<CustomButton
										outlined
										onClick={onFilterClear}
										label={t('categoryPageModal.clear')}
									/>
								</View>
								<View className='w-1/2'>
									<CustomButton
										onClick={onApplyFilters}
										label={t('categoryPageModal.button')}
									/>
								</View>
							</View>
							<BottomInset />
						</View>

						<View className={'w-full h-[77px]'} />
						<BottomInset />
					</View>
				</CustomModal>
			)}
		</>
	)
}
