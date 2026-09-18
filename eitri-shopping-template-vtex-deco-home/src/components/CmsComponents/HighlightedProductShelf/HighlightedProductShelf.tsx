import { useState, useEffect } from 'react'
import { View, Text } from 'eitri-luminus'
import { getProductsService } from '../../../services/ProductService'
import { ChevronRightIcon } from 'eitri-shopping-template-vtex-deco-shared'
import Eitri from 'eitri-bifrost'
import ShelfOfProducts from '../../ShelfOfProducts/ShelfOfProducts'
import { useTranslation } from 'eitri-i18n'
import type { VtexProduct } from '../../../types/vtex'

interface CountdownTime {
	d: number
	h: number
	m: number
	s: number
	expired: boolean
}

const useCountdown = (endDate?: string, enabled?: boolean): CountdownTime => {
	const [time, setTime] = useState<CountdownTime>({ d: 0, h: 0, m: 0, s: 0, expired: false })

	useEffect(() => {
		if (!enabled || !endDate) return

		const calculateTime = (): CountdownTime => {
			const diff = new Date(endDate).getTime() - new Date().getTime()
			if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0, expired: true }

			return {
				d: Math.floor(diff / (1000 * 60 * 60 * 24)),
				h: Math.floor((diff / (1000 * 60 * 60)) % 24),
				m: Math.floor((diff / (1000 * 60)) % 60),
				s: Math.floor((diff / 1000) % 60),
				expired: false
			}
		}

		setTime(calculateTime())
		const timer = setInterval(() => setTime(calculateTime()), 1000)

		return () => clearInterval(timer)
	}, [endDate, enabled])

	return time
}

interface CountdownTimerProps {
	endDate?: string
	enabled?: boolean
	textColor?: string
}

function CountdownTimer(props: CountdownTimerProps) {
	const { endDate, enabled, textColor } = props
	const { t } = useTranslation()
	const time = useCountdown(endDate, enabled)
	const pad = (n: number) => String(n).padStart(2, '0')

	const timeUnits = [
		{ value: time.d, label: t('highlightedShelf.days') },
		{ value: time.h, label: t('highlightedShelf.hours') },
		{ value: time.m, label: t('highlightedShelf.minutes') },
		{ value: time.s, label: t('highlightedShelf.seconds') }
	]

	return (
		<View
			className='flex justify-center items-center gap-1 mb-6'
			style={{ color: textColor }}>
			{timeUnits.map((unit, index) => (
				<View
					key={`${unit.label}-${index}`}
					className='flex'>
					<View className='flex flex-col justify-center items-center w-[60px]'>
						<Text className='text-4xl font-bold'>{pad(unit.value)}</Text>
						<Text className='text-xs'>{unit.label}</Text>
					</View>
					{index < timeUnits.length - 1 && (
						<View className='flex flex-col items-center'>
							<Text className='text-4xl font-bold'>:</Text>
						</View>
					)}
				</View>
			))}
		</View>
	)
}

interface HighlightedProductShelfData {
	facets?: Array<{ key: string; value: string }>
	term?: string
	sort?: string
	numberOfItems?: number
	title?: string
	backgroundColor?: string
	textColor?: string
	showTimer?: boolean
	endDate?: string
	[key: string]: unknown
}

interface HighlightedProductShelfProps {
	data?: HighlightedProductShelfData
}

export default function HighlightedProductShelf(props: HighlightedProductShelfProps) {
	const { data } = props
	const { t } = useTranslation()
	const [products, setProducts] = useState<VtexProduct[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const { expired } = useCountdown(data?.endDate, data?.showTimer)

	useEffect(() => {
		fetchProducts()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const fetchProducts = async () => {
		if (!data) return

		setIsLoading(true)
		try {
			const params = {
				facets: data.facets || [],
				query: data.term ?? '',
				sort: data.sort ?? '',
				to: data.numberOfItems || 8
			}

			const result = await getProductsService(params)
			if (result?.products) {
				setProducts(result.products)
			}
		} catch (error) {
			console.error('Error fetching products:', error)
		} finally {
			setIsLoading(false)
		}
	}

	const onSeeMore = () => {
		Eitri.navigation.navigate({
			path: 'ProductCatalog',
			state: {
				params: {
					facets: data?.facets || [],
					query: data?.term ?? '',
					sort: data?.sort ?? ''
				},
				title: data?.title
			}
		})
	}

	if (!data || expired) return null

	return (
		<View
			className='bg-primary py-4'
			style={{ backgroundColor: data.backgroundColor }}>
			<View
				className='flex justify-between items-center px-4 mb-4'
				style={{ color: data.textColor }}>
				<Text className='font-bold'>{data.title}</Text>
				<View
					className='flex items-center gap-1'
					onClick={onSeeMore}>
					<Text className='text-sm'>{t('highlightedShelf.seeMore')}</Text>
					<ChevronRightIcon />
				</View>
			</View>

			{data.showTimer && (
				<CountdownTimer
					endDate={data.endDate}
					enabled={data.showTimer}
					textColor={data.textColor}
				/>
			)}

			<ShelfOfProducts
				isLoading={isLoading}
				products={products}
			/>
		</View>
	)
}
