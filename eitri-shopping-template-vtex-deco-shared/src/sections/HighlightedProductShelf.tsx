import { Text, View } from 'eitri-luminus'
import { useState, useEffect } from 'react'
import { getProductsService } from '../services/ProductService'
import ChevronRightIcon from '../components/ChevronRightIcon/ChevronRightIcon'
import Eitri from 'eitri-bifrost'
import ShelfOfProducts from '../components/ShelfOfProducts/ShelfOfProducts'
import { useTranslation } from 'eitri-i18n'
import type { Facet } from './types'

interface CountdownState {
	d: number
	h: number
	m: number
	s: number
	expired: boolean
}

// Hook customizado para countdown
const useCountdown = (endDate?: string, enabled?: boolean): CountdownState => {
	const [time, setTime] = useState<CountdownState>({ d: 0, h: 0, m: 0, s: 0, expired: false })

	useEffect(() => {
		if (!enabled || !endDate) return

		const calculateTime = (): CountdownState => {
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

const CountdownTimer = ({ endDate, enabled, textColor }: CountdownTimerProps) => {
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

export interface Props {
	/**
	 * @title Título.
	 */
	title?: string
	facets?: Facet[]
	/**
	 * @title Termo de busca.
	 */
	term?: string
	sort?: string
	/**
	 * @title Quantidade de itens.
	 */
	numberOfItems?: number
	/**
	 * @title Exibir contador regressivo.
	 */
	showTimer?: boolean
	/**
	 * @title Data final do contador.
	 * @format datetime
	 */
	endDate?: string
	/**
	 * @title Cor de fundo.
	 */
	backgroundColor?: string
	/**
	 * @title Cor do texto.
	 */
	textColor?: string
}

export default function HighlightedProductShelf({
	title,
	facets = [],
	term = '',
	sort = '',
	numberOfItems = 8,
	showTimer,
	endDate,
	backgroundColor,
	textColor
}: Props) {
	const { t } = useTranslation()
	const [products, setProducts] = useState<any[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const { expired } = useCountdown(endDate, showTimer)

	useEffect(() => {
		fetchProducts()
	}, [])

	const fetchProducts = async () => {
		setIsLoading(true)
		try {
			const params = {
				facets: facets || [],
				query: term ?? '',
				sort: sort ?? '',
				to: numberOfItems || 8
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
					facets: facets || [],
					query: term ?? '',
					sort: sort ?? ''
				},
				title: title
			}
		})
	}

	if (expired) return null

	return (
		<View
			className='bg-primary py-4'
			style={{ backgroundColor }}>
			<View
				className='flex justify-between items-center px-4 mb-4'
				style={{ color: textColor }}>
				<Text className='font-bold'>{title}</Text>
				<View
					className='flex items-center gap-1'
					onClick={onSeeMore}>
					<Text className='text-sm'>{t('highlightedShelf.seeMore')}</Text>
					<ChevronRightIcon />
				</View>
			</View>

			{showTimer && (
				<CountdownTimer
					endDate={endDate}
					enabled={showTimer}
					textColor={textColor}
				/>
			)}

			<ShelfOfProducts
				isLoading={isLoading}
				products={products}
			/>
		</View>
	)
}
