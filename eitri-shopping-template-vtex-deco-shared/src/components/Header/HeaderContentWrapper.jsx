import { getRemoteAppConfigProperty } from '../../utils/getRemoteConfigStyleProperty'
import HeaderOffset from './HeaderOffset'
import { DIMENSIONS } from '../../utils/constants'

export const HEADER_VARIANT = {
	FIXED: 'fixed',
	INLINE: 'inline',
	SCROLL_SOLID: 'scroll-solid'
}

export default function HeaderContentWrapper(props) {
	const {
		children,
		scrollEffect,
		scrollEffectMaxTranslate,
		// Ativa o modo "transparente -> leve blur": o header nasce com fundo
		// transparente, ganha um blur suave ao rolar para baixo (e some por
		// completo após `hideAfterViewportHeights` telas de scroll) e volta ao
		// transparente/visível assim que o usuário rola para cima.
		blurOnScroll,
		hideAfterViewportHeights = 3.5,
		height,
		className,
		containerClassName,
		reserveSpace = true,
		variant = HEADER_VARIANT.INLINE,
		...rest
	} = props

	const isFixed = variant === HEADER_VARIANT.FIXED
	const isScrollSolid = variant === HEADER_VARIANT.SCROLL_SOLID

	const [safeAreaTop, setSafeAreaTop] = useState(0)
	const [translate, setTranslate] = useState('')
	const [isSolid, setIsSolid] = useState(false)
	const [isBlurred, setIsBlurred] = useState(false)

	const [headerHeight, setHeaderHeight] = useState(height || DIMENSIONS.HEADER_HEIGHT)
	const safeAreaTopRef = useRef()
	const scrollHandler = useRef()

	safeAreaTopRef.current = safeAreaTop

	const _height = Math.max(0, headerHeight - 2)

	useEffect(() => {
		initScrollEffect()
	}, [])

	useEffect(() => {
		if (!isFixed) return
		const headerElement = document.getElementById('header')
		if (!headerElement) return
		const observer = new ResizeObserver(([entry]) => {
			setHeaderHeight(entry.contentRect.height)
		})
		observer.observe(headerElement)
		return () => observer.disconnect()
	}, [isFixed])

	useEffect(() => {
		if (!isScrollSolid) return
		const sentinelElement = document.getElementById('header-sentinel')
		if (!sentinelElement) return
		const observer = new IntersectionObserver(([entry]) => {
			setIsSolid(!entry.isIntersecting)
		})
		observer.observe(sentinelElement)
		return () => observer.disconnect()
	}, [isScrollSolid])

	const initScrollEffect = async () => {
		if (!scrollEffect || !isFixed) {
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

	// Distância mínima (px) a partir do topo para considerarmos que "saiu do
	// topo" e já pode ganhar o blur — evita que um scroll de 1px já borre o header.
	const BLUR_SCROLL_THRESHOLD = 24

	let ticking = false
	let lastScrollTop = window.document.documentElement.scrollTop

	if (!scrollHandler.current) {
		scrollHandler.current = () => {
			if (!ticking) {
				window.requestAnimationFrame(() => {
					let currentScrollTop = window.document.documentElement.scrollTop
					const distance = currentScrollTop - lastScrollTop
					const isNearTop = currentScrollTop <= BLUR_SCROLL_THRESHOLD

					if (blurOnScroll && isNearTop) {
						setIsBlurred(false)
					}

					if (Math.abs(distance) > 0.8) {
						if (distance > 0) {
							// Rolando para baixo: aplica o leve blur (fora do topo) e, depois de
							// algumas telas de scroll, esconde o header por completo.
							const hideThreshold = blurOnScroll
								? window.innerHeight * hideAfterViewportHeights
								: safeAreaTopRef.current

							if (blurOnScroll && !isNearTop) {
								setIsBlurred(true)
							}

							if (currentScrollTop > hideThreshold) {
								setTranslate(scrollEffectMaxTranslate ?? '-100%')
							}
						} else if (currentScrollTop < lastScrollTop) {
							// Rolando para cima: reexibe o header imediatamente. O blur só é
							// desfeito quando o usuário efetivamente chega perto do topo
							// (ver checagem de `isNearTop` acima) — assim ele não fica
							// transparente no meio do caminho.
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

	const solidBackgroundClasses = 'shadow-md backdrop-blur-sm bg-header-background'
	const transparentBlurBackgroundClasses = isBlurred
		? 'shadow-sm backdrop-blur-md bg-header-background/40'
		: 'bg-transparent'
	const fixedBackgroundClasses = blurOnScroll ? transparentBlurBackgroundClasses : solidBackgroundClasses
	const positionClasses = isFixed
		? `fixed top-0 left-0 right-0 z-[9900] ${fixedBackgroundClasses}`
		: isScrollSolid
			? `sticky top-0 z-[9900] ${isSolid ? solidBackgroundClasses : ''}`
			: ''

	return (
		<>
			{isScrollSolid && <View id='header-sentinel' />}
			<View
				id='header-container'
				style={isFixed ? { transform: `translateY(${translate})` } : undefined}
				className={`${positionClasses} backdrop-blur-sm bg-header-background transition-all duration-500 ease-in-out w-full ${containerClassName || ''}`}>
				<View topInset={'auto'} />
				<View id='header'>
					<View
						id='header-content'
						className={`min-h-[60px] flex items-center relative w-screen py-[8px] px-4 gap-3 ${className}`}
						{...rest}>
						{children}
					</View>
				</View>
			</View>
			{isFixed && (
				// backdrop behind the safe-area/status-bar while the header above translates on scrollEffect
				<View
					topInset={'auto'}
					className={`fixed top-0 left-0 right-0 z-[2000] w-full`}
				/>
			)}
			{isFixed && reserveSpace && <HeaderOffset height={_height} />}
		</>
	)
}
