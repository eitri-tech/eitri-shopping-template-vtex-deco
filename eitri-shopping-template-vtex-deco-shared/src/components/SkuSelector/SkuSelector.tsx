import { useEffect, useState, useMemo } from 'react'
import { Image, Text, View } from 'eitri-luminus'
import { RemoteConfig } from 'eitri-shopping-vtex-shared'
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
	return skus.find(s => attributeKeys.every(k => s.attributes[k] === selections[k])) || null
}

const COR_MAP: Record<string, string> = {
	Azul: '#3b5bdb',
	Vermelho: '#e03131',
	Verde: '#2f9e44',
	Preto: '#212529',
	Branco: '#f8f9fa',
	Amarelo: '#f59f00',
	Rosa: '#e64980',
	Cinza: '#868e96'
}

interface ColorSwatchProps {
	color: string
	selected: boolean
	status: OptionStatus
	onClick?: () => void
}

function ColorSwatch({ color, selected, status, onClick }: ColorSwatchProps) {
	const hex = COR_MAP[color]
	const unavailable = !status.availableExists
	const inexistent = !status.exists

	return (
		<View
			onClick={onClick}
			className={`
				relative w-10 h-10 rounded-full cursor-pointer transition-all duration-200
				flex items-center justify-center
				${selected ? 'ring-2 ring-offset-2 ring-gray-900 scale-110' : ''}
				${unavailable && !inexistent ? 'opacity-50' : ''}
				${inexistent ? 'opacity-20 cursor-not-allowed' : ''}
      		`}>
			{unavailable && !inexistent && (
				<View className='absolute inset-0 flex items-center justify-center rounded-full overflow-hidden'>
					<View className='absolute w-[120%] h-[1.5px] bg-white opacity-70 rotate-45' />
				</View>
			)}
		</View>
	)
}

interface OptionChipProps {
	imageUrl?: string
	value: string
	selected: boolean
	status: OptionStatus
	onClick?: () => void
}

function OptionChip({ imageUrl, value, selected, status, onClick }: OptionChipProps) {
	const unavailable = !status.availableExists
	const inexistent = !status.exists

	return (
		<View
			onClick={!inexistent ? onClick : undefined}
			className={`border border-2 px-3 py-2 rounded text-sm transition-all duration-200 select-none flex flex-col gap-2 items-center justify-center
						${inexistent ? 'opacity-20 cursor-not-allowed border-gray-300 text-gray-600' : ''}
						${
							selected
								? 'border border-primary text-primary'
								: unavailable && !inexistent
									? 'text-gray-400 border-gray-200'
									: 'text-gray-600 border-gray-300'
						}
      `}>
			{imageUrl && (
				<View className={''}>
					<Image
						src={imageUrl}
						width={70}
						className={'mix-blend-darken'}
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
				// A SKU with no sellers (or a seller with no commertialOffer) shouldn't crash the
				// whole selector — treat it as unavailable instead.
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
		onSkuChange?.(newSku)
	}

	if (attributeKeys?.length === 0) return null

	return (
		<View className={'flex flex-col gap-4 w-full'}>
			{attributeKeys.map(key => {
				const values = getUniqueValues(skus, key)
				const statusMap = getOptionStatus(skus, attributeKeys, key, selections)

				return (
					<View key={key}>
						<View className='flex items-center gap-1 mb-2'>
							<Text className='text-sm text-gray-600'>{key}:</Text>
							{selections[key] && (
								<Text className='text-sm text-gray-700 font-semibold'>{selections[key]}</Text>
							)}
						</View>
						<View className='flex flex-row flex-wrap gap-2'>
							{(sortSku(values) ?? []).map(value => {
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
									/>
								)
							})}
						</View>
					</View>
				)
			})}
		</View>
	)
}
