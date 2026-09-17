export default function HeaderMenu(props) {
	const { iconColor, content, showDrawer, onCloseDrawer, onPressOpenButton } = props

	const [initialTransparency, setInitialTransparency] = useState('transparent')

	// Pra tratar o flicker do drawer
	useEffect(() => {
		setTimeout(() => {
			setInitialTransparency('solid')
		}, 2000)
	}, [])

	return (
		<>
			<View>
				<svg
					viewBox='0 0 24 24'
					fill='none'
					xmlns='http://www.w3.org/2000/svg'>
					<g
						id='SVGRepo_bgCarrier'
						strokeWidth='0'></g>
					<g
						id='SVGRepo_tracerCarrier'
						strokeLinecap='round'
						strokeLinejoin='round'></g>
					<g id='SVGRepo_iconCarrier'>
						{' '}
						<path
							d='M4 6H20M4 12H20M4 18H20'
							stroke='#000000'
							strokeWidth='2'
							strokeLinecap='round'
							strokeLinejoin='round'></path>{' '}
					</g>
				</svg>
			</View>
			<>
				{showDrawer && (
					<View
						onPress={onCloseDrawer}
						position='fixed'
						customColor='#000000'
						top='0px'
						left='0px'
						bottom='0px'
						opacity='half'
						zIndex='998'
						right='0px'
					/>
				)}
				<View
					id={'drawer-content'}
					position='absolute'
					top={0}
					width='80vw'
					height='100vh'
					minHeight='100vh'
					maxHeight='100vh'
					customColor='#ffffff'
					borderRadiusRightTop='medium'
					borderRadiusRightBottom='medium'
					zIndex='999'
					opacity={initialTransparency}
					left={showDrawer ? '0' : '-80vw'}>
					<View padding='display'>
						<View topInset />
						{content}
						<View bottomInset />
					</View>
				</View>
			</>
		</>
	)
}
