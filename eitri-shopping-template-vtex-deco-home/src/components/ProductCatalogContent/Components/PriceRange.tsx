import { useState, useRef, useCallback, useEffect } from 'react'
import type { ChangeEvent, MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from 'react'
import { View } from 'eitri-luminus'
import type { View as ViewType } from 'eitri-luminus'
import { CustomInput } from 'eitri-shopping-template-vtex-deco-shared'
import { formatPrice } from '../../../utils/utils'
import { useTranslation } from 'eitri-i18n'

interface PriceRangeProps {
	initialMin?: number
	initialMax?: number
	onChange?: (range: string) => void
	rangeMin?: number
	rangeMax?: number
	step?: number
}

type Thumb = 'min' | 'max'

export default function PriceRange(props: PriceRangeProps) {
	const { initialMin = 20, initialMax = 80, onChange, rangeMin = 0, rangeMax = 100, step = 1 } = props

	const { t } = useTranslation()
	const [minValue, setMinValue] = useState(initialMin)
	const [maxValue, setMaxValue] = useState(initialMax)
	const [isDragging, setIsDragging] = useState<Thumb | null>(null)
	const [focusedField, setFocusedField] = useState<Thumb | null>(null)
	const [minText, setMinText] = useState(String(initialMin))
	const [maxText, setMaxText] = useState(String(initialMax))

	const sliderRef = useRef<ViewType>(null)
	const minThumbRef = useRef<ViewType>(null)
	const maxThumbRef = useRef<ViewType>(null)

	// Sync with props when they change
	useEffect(() => {
		setMinValue(initialMin)
		setMaxValue(initialMax)
	}, [initialMin, initialMax])

	// Call onChange whenever values change
	useEffect(() => {
		if (onChange) {
			onChange(`${minValue}:${maxValue}`)
		}
	}, [minValue, maxValue, onChange])

	// Keep the input buffers synced with the slider while not being edited
	useEffect(() => {
		if (focusedField !== 'min') setMinText(String(minValue))
	}, [minValue, focusedField])

	useEffect(() => {
		if (focusedField !== 'max') setMaxText(String(maxValue))
	}, [maxValue, focusedField])

	const sanitizeDigits = (raw?: string) => (raw || '').replace(/\D/g, '')

	const commitMin = () => {
		setFocusedField(null)
		const parsed = parseInt(sanitizeDigits(minText), 10)
		if (Number.isNaN(parsed)) {
			setMinText(String(minValue))
			return
		}
		setMinValue(Math.max(rangeMin, Math.min(parsed, maxValue - step)))
	}

	const commitMax = () => {
		setFocusedField(null)
		const parsed = parseInt(sanitizeDigits(maxText), 10)
		if (Number.isNaN(parsed)) {
			setMaxText(String(maxValue))
			return
		}
		setMaxValue(Math.min(rangeMax, Math.max(parsed, minValue + step)))
	}

	const getValueFromPosition = useCallback(
		(clientX: number) => {
			if (!sliderRef.current) return 0
			const rect = document.getElementById('slider')?.getBoundingClientRect()
			if (!rect) return 0
			const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
			const value = Math.round((percentage * (rangeMax - rangeMin) + rangeMin) / step) * step

			return Math.max(rangeMin, Math.min(rangeMax, value))
		},
		[rangeMin, rangeMax, step]
	)

	const handleMouseDown = (thumb: Thumb) => (e: ReactMouseEvent) => {
		e.preventDefault()
		e.stopPropagation()
		setIsDragging(thumb)

		const handleMouseMove = (e: globalThis.MouseEvent) => {
			const newValue = getValueFromPosition(e.clientX)

			if (thumb === 'min') {
				setMinValue(Math.min(newValue, maxValue - step))
			} else {
				setMaxValue(Math.max(newValue, minValue + step))
			}
		}

		const handleMouseUp = () => {
			setIsDragging(null)
			document.removeEventListener('mousemove', handleMouseMove)
			document.removeEventListener('mouseup', handleMouseUp)
		}

		document.addEventListener('mousemove', handleMouseMove)
		document.addEventListener('mouseup', handleMouseUp)
	}

	const handleTouchStart = (thumb: Thumb) => (e: ReactTouchEvent) => {
		e.preventDefault()
		e.stopPropagation()
		setIsDragging(thumb)

		const handleTouchMove = (e: globalThis.TouchEvent) => {
			const touch = e.touches[0]
			const newValue = getValueFromPosition(touch.clientX)

			if (thumb === 'min') {
				setMinValue(Math.min(newValue, maxValue - step))
			} else {
				setMaxValue(Math.max(newValue, minValue + step))
			}
		}

		const handleTouchEnd = () => {
			setIsDragging(null)
			document.removeEventListener('touchmove', handleTouchMove)
			document.removeEventListener('touchend', handleTouchEnd)
		}

		document.addEventListener('touchmove', handleTouchMove)
		document.addEventListener('touchend', handleTouchEnd)
	}

	const minPercentage = ((minValue - rangeMin) / (rangeMax - rangeMin)) * 100
	const maxPercentage = ((maxValue - rangeMin) / (rangeMax - rangeMin)) * 100

	return (
		<View className='w-full bg-white'>
			<View className='mb-4'>
				<View className='relative px-2 h-6 flex items-center'>
					{/* Track */}
					<View
						ref={sliderRef}
						id='slider'
						className='relative w-full h-2 bg-gray-200 rounded-full cursor-pointer'>
						{/* Active range */}
						<View
							className='absolute h-2 bg-primary rounded-full'
							style={{
								left: `${minPercentage}%`,
								width: `${maxPercentage - minPercentage}%`
							}}
						/>

						{/* Min thumb */}
						<View
							ref={minThumbRef}
							id='min-thumb'
							className={`absolute w-6 h-6 bg-white border-4 border-primary rounded-full cursor-grab transform -translate-y-1/2 top-1/2 transition-transform ${
								isDragging === 'min' ? 'scale-110 cursor-grabbing shadow-lg' : ''
							}`}
							style={{ left: `${minPercentage}%`, transform: 'translateX(-50%) translateY(-50%)' }}
							onMouseDown={handleMouseDown('min')}
							onTouchStart={handleTouchStart('min')}
						/>

						{/* Max thumb */}
						<View
							ref={maxThumbRef}
							id='max-thumb'
							className={`absolute w-6 h-6 bg-white border-4 border-primary rounded-full cursor-grab transform -translate-y-1/2 top-1/2 transition-transform ${
								isDragging === 'max' ? 'scale-110 cursor-grabbing shadow-lg' : ''
							}`}
							style={{ left: `${maxPercentage}%`, transform: 'translateX(-50%) translateY(-50%)' }}
							onMouseDown={handleMouseDown('max')}
							onTouchStart={handleTouchStart('max')}
						/>
					</View>
				</View>

				{/* Scale indicators */}
				<View className='flex justify-between mt-2 text-xs text-gray-400'>
					<View>{formatPrice(rangeMin)}</View>
					<View>{formatPrice(Math.floor(rangeMin + (rangeMax - rangeMin) * 0.5))}</View>
					<View>{formatPrice(rangeMax)}</View>
				</View>
			</View>

			{/* Input fields */}
			<View className='flex justify-between w-full gap-4'>
				<View className='flex-1'>
					<CustomInput
						label={t('priceRange.min')}
						value={focusedField === 'min' ? minText : formatPrice(minValue)}
						onChange={(e: ChangeEvent<HTMLInputElement>) => setMinText(sanitizeDigits(e.target.value))}
						onFocus={() => {
							setFocusedField('min')
							setMinText(String(minValue))
						}}
						onBlur={commitMin}
						inputMode='numeric'
					/>
				</View>
				<View className='flex-1'>
					<CustomInput
						label={t('priceRange.max')}
						value={focusedField === 'max' ? maxText : formatPrice(maxValue)}
						onChange={(e: ChangeEvent<HTMLInputElement>) => setMaxText(sanitizeDigits(e.target.value))}
						onFocus={() => {
							setFocusedField('max')
							setMaxText(String(maxValue))
						}}
						onBlur={commitMax}
						inputMode='numeric'
					/>
				</View>
			</View>
		</View>
	)
}
