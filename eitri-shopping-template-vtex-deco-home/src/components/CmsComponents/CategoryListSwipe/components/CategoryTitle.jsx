export default function CategoryTitle(props) {
	const { onClick, title, icon, hasSubItems } = props

	return (
		<View
			onClick={onClick}
			className='p-4 flex justify-between items-center shadow-md bg-white'>
			<View className='flex items-center gap-4'>
				{icon && (
					<Image
						className='max-w-[30px]'
						src={icon}
					/>
				)}
				<Text className='font-bold'>{title}</Text>
			</View>
			{hasSubItems && (
				<svg
					xmlns='http://www.w3.org/2000/svg'
					width='24'
					height='24'
					viewBox='0 0 24 24'
					fill='none'
					stroke='currentColor'
					strokeWidth='2'
					strokeLinecap='round'
					strokeLinejoin='round'
					className=''>
					<line
						x1='5'
						y1='12'
						x2='19'
						y2='12'></line>
					<polyline points='12 5 19 12 12 19'></polyline>
				</svg>
			)}
		</View>
	)
}
