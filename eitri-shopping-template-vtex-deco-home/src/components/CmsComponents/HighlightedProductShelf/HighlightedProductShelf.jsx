import { useState, useEffect } from 'react'
import { getProductsService } from '../../../services/ProductService'
import ProductCard from '../../ProductCard/ProductCard'
import { LuChevronRight } from 'react-icons/lu'
import Eitri from 'eitri-bifrost'
import ShelfOfProducts from '../../ShelfOfProducts/ShelfOfProducts'
import { useTranslation } from 'eitri-i18n'

// Hook customizado para countdown
const useCountdown = (endDate, enabled) => {
	const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0, expired: false })

	useEffect(() => {
		if (!enabled || !endDate) return

		const calculateTime = () => {
			const diff = new Date(endDate) - new Date()
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

// Componente Timer
const CountdownTimer = ({ endDate, enabled, textColor }) => {
	const { t } = useTranslation()
	const time = useCountdown(endDate, enabled)
	const pad = n => String(n).padStart(2, '0')

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

// Componente principal
export default function HighlightedProductShelf({ data }) {
	const { t } = useTranslation()
	const [products, setProducts] = useState([])
	const [isLoading, setIsLoading] = useState(false)
	const { expired } = useCountdown(data?.endDate, data?.showTimer)

	useEffect(() => {
		fetchProducts()
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
					facets: data.facets || [],
					query: data.term ?? '',
					sort: data.sort ?? ''
				},
				title: data.title
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
					<LuChevronRight />
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
