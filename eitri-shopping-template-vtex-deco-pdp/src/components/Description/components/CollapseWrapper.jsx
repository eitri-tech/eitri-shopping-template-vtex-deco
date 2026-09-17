import { useState } from 'react'
import { Divisor } from 'eitri-shopping-template-vtex-deco-shared'

// Componente SVG para ícone de seta para baixo (collapsed)
const ChevronDownIcon = ({ width = 24, height = 24, color = '#000' }) => (
	<svg
		width={width}
		height={height}
		viewBox='0 0 24 24'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'>
		<path
			d='M6 9L12 15L18 9'
			stroke={color}
			strokeWidth='2'
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
	</svg>
)

// Componente SVG para ícone de seta para cima (expanded)
const ChevronUpIcon = ({ width = 24, height = 24, color = '#000' }) => (
	<svg
		width={width}
		height={height}
		viewBox='0 0 24 24'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'>
		<path
			d='M18 15L12 9L6 15'
			stroke={color}
			strokeWidth='2'
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
	</svg>
)

export default function CollapseWrapper(props) {
	const { children, title, defaultCollapsed } = props

	const [collapsed, setCollapsed] = useState(true)

	useEffect(() => {
		setCollapsed(defaultCollapsed)
	}, [defaultCollapsed])

	return (
		<View className='w-full overflow-x-hidden mb-2'>
			<View onClick={() => setCollapsed(!collapsed)}>
				<View className='flex items-center justify-between w-full py-2'>
					<Text className='text-lg font-semibold'>{title}</Text>
					<View className='transition-transform duration-200'>
						{collapsed ? (
							<ChevronDownIcon
								width={26}
								height={26}
								color='#374151'
							/>
						) : (
							<ChevronUpIcon
								width={26}
								height={26}
								color='#374151'
							/>
						)}
					</View>
				</View>
			</View>
			<Divisor />
			{!collapsed && <View className={'pt-4 pb-2'}>{children}</View>}
		</View>
	)
}
