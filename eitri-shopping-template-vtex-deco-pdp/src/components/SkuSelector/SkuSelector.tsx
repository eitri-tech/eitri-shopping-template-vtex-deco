import { useEffect, useState, useMemo } from 'react'
import { Image, Text, View } from 'eitri-luminus'
import { RemoteConfig } from 'eitri-shopping-vtex-shared'
import { MinusIcon, PlusIcon } from 'eitri-shopping-template-vtex-deco-shared'
import { sortSku } from '../../utils/skuSort'
import type { VtexProduct, VtexSku } from '../../types/vtex'

interface Sku {
	itemId?: string
	available: boolean
	attributes: Record<string, string | null>
}

type Selections = Record<string, string>

interface OptionStatus {
	exists: boolean
	availableExists: boolean
}

interface SkuSelectorProps {
	product: VtexProduct
	currentSku?: VtexSku
	onSkuChange?: (sku: Sku | null) => void
}

const AVAILABLE = 'available'
const UNAVAILABLE = 'unavailable'

type StatusEntry = [string, OptionStatus]

function keysFromEntries(entries: StatusEntry[]): string[] {
	return entries.map(([key]) => key)
}

function groupBy<T>(items: T[], groupFn: (item: T) => string): Map<string, T[]> {
	return items.reduce<Map<string, T[]>>((acc, item) => {
		const key = groupFn(item)
		const bucket = acc.get(key) ?? []
		bucket.push(item)
		acc.set(key, bucket)
		return acc
	}, new Map())
}

// Available values first (sorted), then unavailable ones unless hidden.
function getVisibleValues(statusMap: Record<string, OptionStatus>, hideUnavailable: boolean): string[] {
	const statusEntries = Object.entries(statusMap)
	const group = groupBy(statusEntries, ([, { availableExists }]) => (availableExists ? AVAILABLE : UNAVAILABLE))

	const visibleValues = sortSku(keysFromEntries(group.get(AVAILABLE) ?? [])) ?? []

	if (!hideUnavailable) {
		visibleValues.push(...(sortSku(keysFromEntries(group.get(UNAVAILABLE) ?? [])) ?? []))
	}

	return visibleValues
}

// Get unique values per attribute
function getUniqueValues(skus: Sku[], key: string): string[] {
	return [...new Set(skus.map(s => s.attributes[key]).filter((v): v is string => v != null))]
}

// Given current selections (excluding the key being evaluated),
// returns a map of value -> { exists, availableExists }
function getOptionStatus(
	skus: Sku[],
	attributeKeys: string[],
	key: string,
	selections: Selections
): Record<string, OptionStatus> {
	const otherKeys = attributeKeys.filter(k => k !== key)
	const values = getUniqueValues(skus, key)

	return values.reduce<Record<string, OptionStatus>>((acc, value) => {
		const matching = skus.filter(s => {
			if (s.attributes[key] !== value) return false
			return otherKeys.every(k => !selections[k] || s.attributes[k] === selections[k])
		})
		acc[value] = {
			exists: matching.length > 0,
			availableExists: matching.some(s => s.available)
		}
		return acc
	}, {})
}

// Find selected SKU
function findSelectedSku(skus: Sku[], attributeKeys: string[], selections: Selections): Sku | null {
	if (Object.keys(selections).length < attributeKeys.length) return null
	const matchingSkus = skus.filter(s => attributeKeys.every(k => s.attributes[k] === selections[k]))
	return matchingSkus.find(s => s.available) || matchingSkus[0] || null
}

interface OptionChipProps {
	imageUrl?: string
	value: string
	selected: boolean
	status: OptionStatus
	onClick?: () => void
	standardizedSize?: boolean
	hideUnavailable?: boolean
}

function OptionChip(props: OptionChipProps) {
	const { imageUrl, value, selected, status, onClick, standardizedSize, hideUnavailable } = props
	const unavailable = !status.availableExists
	const inexistent = !status.exists
	const disabled = unavailable || inexistent

	if (unavailable && hideUnavailable) return null

	return (
		<View
			onClick={!disabled ? onClick : undefined}
			className={`relative border border-2 rounded font-bold font-mono text-sm transition-all duration-200 select-none flex flex-col gap-2 items-center justify-center
						${standardizedSize ? 'min-w-[44px] min-h-[40px] px-3 py-2' : 'px-3 py-2'}
						${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
						${inexistent ? 'opacity-20 border-gray-300 text-gray-600' : ''}
						${
							selected && !disabled
								? 'border-primary bg-primary text-primary-content'
								: unavailable && !inexistent
									? 'bg-white text-gray-400 border-gray-200'
									: 'bg-white text-primary border-primary'
						}
      `}>
			{imageUrl && (
				<View>
					<Image
						src={imageUrl}
						width={70}
					/>
				</View>
			)}
			<Text>{value}</Text>
			{unavailable && !inexistent && (
				<View className='absolute inset-0 flex items-center justify-center rounded-lg overflow-hidden pointer-events-none'>
					<View className='absolute w-full h-[1.5px] bg-gray-300 rotate-12' />
				</View>
			)}
		</View>
	)
}

export default function SkuSelector(props: SkuSelectorProps) {
	const { product, currentSku, onSkuChange } = props

	const [selections, setSelections] = useState<Selections>({})
	const [isUnavailableHidden, setHideUnavailable] = useState(true)

	useEffect(() => {
		if (!currentSku?.variations?.length) return
		const currentSelection = currentSku.variations.reduce<Selections>((acc, variation) => {
			if (variation.name && variation.values?.[0]) {
				acc[variation.name] = variation.values[0]
			}
			return acc
		}, {})
		setSelections(currentSelection)
	}, [currentSku])

	const skus = useMemo<Sku[]>(() => {
		const hiddenVariations = (RemoteConfig.getContent('appConfigs.pdp.hiddenVariations') as string[]) || []

		const res: Sku[] = (product.items ?? []).map(item => {
			const sellerDefault = item.sellers?.find(s => s.sellerDefault) ?? item.sellers?.[0]
			return {
				itemId: item.itemId,
				available: (sellerDefault?.commertialOffer?.AvailableQuantity ?? 0) > 0,
				attributes: (item?.variations ?? []).reduce<Record<string, string | null>>((acc, variation) => {
					if (hiddenVariations?.includes(variation.name ?? '')) return acc
					if (variation.name) {
						acc[variation.name] = variation.values?.[0] ?? null
					}
					return acc
				}, {})
			}
		})

		return res.filter(sku => Object.keys(sku.attributes).length > 0)
	}, [product])

	const attributeKeys = useMemo(() => (skus.length > 0 ? Object.keys(skus[0].attributes) : []), [skus])

	const handleSelect = (key: string, value: string) => {
		const isSame = selections[key] === value
		if (isSame) {
			return
		}

		const next = { ...selections, [key]: value }
		const newSku = findSelectedSku(skus, attributeKeys, next)
		if (!newSku?.available) return

		onSkuChange?.(newSku)
	}

	if (attributeKeys?.length === 0) return null

	const hideUnavailable = RemoteConfig.getContent('appConfigs.pdp.hideUnavailableVariations') === true

	return (
		<View className='flex flex-col gap-4 w-full'>
			{attributeKeys.map(key => {
				const isRingSize = key?.toLowerCase().includes('aro')
				const statusMap = getOptionStatus(skus, attributeKeys, key, selections)
				const visibleValues = getVisibleValues(statusMap, hideUnavailable)

				return (
					<View key={key}>
						<View className='mb-4'>
							<Text className='text-sm font-bold'>{key}</Text>
						</View>
						<View className='flex flex-row flex-wrap gap-2'>
							{visibleValues.map(value => {
								let imageUrl = ''
								const isCor = key?.toLowerCase() === 'cor'
								if (isCor) {
									const item =
										(product.items ?? []).find(v =>
											v.variations?.some(
												variation => variation.name === key && variation.values?.[0] === value
											)
										) || null
									imageUrl = item?.images?.[0]?.imageUrl || ''
								}

								return (
									<OptionChip
										key={value}
										imageUrl={imageUrl}
										value={value}
										selected={selections[key] === value}
										status={statusMap[value]}
										onClick={() => handleSelect(key, value)}
										standardizedSize={isRingSize}
										hideUnavailable={isUnavailableHidden}
									/>
								)
							})}
							{!hideUnavailable && (
								<View
									className='relative text-sm transition-all duration-200 select-none flex flex-col gap-2 items-center justify-center'
									onClick={() => setHideUnavailable(x => !x)}>
									{isUnavailableHidden ? <PlusIcon size={30} /> : <MinusIcon size={30} />}
								</View>
							)}
						</View>
					</View>
				)
			})}
		</View>
	)
}
