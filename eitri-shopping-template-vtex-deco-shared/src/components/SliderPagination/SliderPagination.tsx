import { View } from 'eitri-luminus'
import { FiChevronLeft } from 'react-icons/fi'

interface SliderPaginationProps {
	count: number
	activeIndex: number
	className?: string
	onPrev?: () => void
	onNext?: () => void
	[key: string]: unknown
}

export default function SliderPagination(props: SliderPaginationProps) {
	const { count, activeIndex, className, onPrev, onNext } = props

	if (count <= 1) return null

	const showArrows = Boolean(onPrev || onNext)

	return (
		<View
			className={`flex items-center ${
				showArrows ? 'justify-between w-full px-4' : 'justify-center gap-3'
			} ${className ?? ''}`}>
			{showArrows && (
				<View
					onClick={onPrev}
					className={`flex items-center justify-center text-neutral-content ${
						activeIndex <= 0 ? 'opacity-30' : ''
					}`}>
					<FiChevronLeft size={19} />
				</View>
			)}

			<View className='flex justify-center items-center gap-1'>
				{Array.from({ length: count }).map((_, index) => (
					<View
						key={index}
						className={`${activeIndex === index ? 'w-[24px]' : 'w-[5px]'} h-[5px] rounded-full ${
							activeIndex === index ? 'bg-neutral-700' : 'bg-base-300'
						} transition-[width,background-color] duration-300 ease-in-out`}
					/>
				))}
			</View>

			{showArrows && (
				<View
					onClick={onNext}
					className={`flex items-center justify-center rotate-180 text-neutral-content ${
						activeIndex >= count - 1 ? 'opacity-30' : ''
					}`}>
					<FiChevronLeft size={19} />
				</View>
			)}
		</View>
	)
}
