import { getRemoteAppConfigProperty } from '../../utils/getRemoteConfigStyleProperty'
import HeaderOffset from './HeaderOffset'
import { DIMENSIONS } from '../../utils/constants'

export default function HeaderContentWrapper(props) {
	const { children, scrollEffect, scrollEffectMaxTranslate, height, className, containerClassName, ...rest } = props

	const [safeAreaTop, setSafeAreaTop] = useState(0)
	const [translate, setTranslate] = useState('')

	const [headerHeight, setHeaderHeight] = useState(height || DIMENSIONS.HEADER_HEIGHT)
	const safeAreaTopRef = useRef()
	const scrollHandler = useRef()

	safeAreaTopRef.current = safeAreaTop

	const _height = Math.max(0, headerHeight - 2)

	useEffect(() => {
		initScrollEffect()
	}, [])

	useEffect(() => {
		const headerElement = document.getElementById('header')
		if (!headerElement) return
		const observer = new ResizeObserver(([entry]) => {
			setHeaderHeight(entry.contentRect.height)
		})
		observer.observe(headerElement)
		return () => observer.disconnect()
	}, [])

	const initScrollEffect = async () => {
		if (!scrollEffect) {
			return
		}
		const headerScrollEffect = await getRemoteAppConfigProperty('headerScrollEffect')
		if (typeof headerScrollEffect === 'boolean' && !headerScrollEffect) {
			return
		}
		loadSafeAreas()
		window.addEventListener('scroll', scrollHandler.current)
		return () => {
			window.removeEventListener('scroll', scrollHandler.current)
		}
	}

	const loadSafeAreas = async () => {
		const { EITRI } = window
		if (EITRI) {
			const { superAppData } = await EITRI.miniAppConfigs
			const { safeAreaInsets } = superAppData
			const { top } = safeAreaInsets
			setSafeAreaTop(top)
		}
	}

	let ticking = false
	let lastScrollTop = window.document.documentElement.scrollTop

	if (!scrollHandler.current) {
		scrollHandler.current = () => {
			if (!ticking) {
				window.requestAnimationFrame(() => {
					let currentScrollTop = window.document.documentElement.scrollTop
					const distance = currentScrollTop - lastScrollTop
					if (Math.abs(distance) > 0.8) {
						if (distance > 0 && currentScrollTop > safeAreaTopRef.current) {
							setTranslate(scrollEffectMaxTranslate ?? '-100%')
						} else if (currentScrollTop < lastScrollTop) {
							setTranslate('0')
						}
					}

					lastScrollTop = Math.max(currentScrollTop, 0)

					ticking = false
				})

				ticking = true
			}
		}
	}

	return (
		<>
			<View
				id='header-container'
				style={{
					transform: `translateY(${translate})`
				}}
				className={`fixed top-0 left-0 right-0 z-[9900] transition-all duration-500 ease-in-out shadow-md w-full backdrop-blur-sm bg-header-background ${containerClassName || ''}`}>
				<View topInset={'auto'} />
				<View id='header'>
					<View
						id='header-content'
						className={`min-h-[60px] flex items-center w-screen py-[8px] px-4 gap-3 ${className}`}
						{...rest}>
						{children}
					</View>
				</View>
			</View>
			<View
				topInset={'auto'}
				className={`fixed top-0 left-0 right-0 z-[2000] w-full`}
			/>
			<HeaderOffset height={_height} />
		</>
	)
}
