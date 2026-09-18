import { useEffect, useRef, useState } from 'react'
import Eitri from 'eitri-bifrost'

const SCROLL_DELTA_THRESHOLD = 15

// Module-level pub/sub so any component can react to bottom bar visibility
let currentVisible = true
const listeners = new Set<(visible: boolean) => void>()

function setVisible(visible: boolean) {
	if (currentVisible === visible) return
	currentVisible = visible
	listeners.forEach(fn => fn(visible))
}

/**
 * Single entry point to toggle the native bottom bar, keeping it in sync with
 * the module-level visibility state consumed by useBottomBarVisibility (e.g.
 * OverHeader). Any code that hides/shows the bottom bar outside of the scroll
 * handler below (e.g. DecoCMSContentRender while the CMS loads) must go
 * through this instead of calling Eitri.bottomBar directly, otherwise this
 * state gets out of sync with the native bar's real visibility.
 */
export function setBottomBarVisible(visible: boolean) {
	setVisible(visible)
	if (visible) {
		Eitri.bottomBar.show().catch(() => {})
	} else {
		Eitri.bottomBar.hide().catch(() => {})
	}
}

/**
 * Subscribes to bottom bar visibility changes driven by useRetractableBottomBar.
 * Use in fixed-bottom components (e.g. OverHeader) that need to retract together
 * with the native bottom bar.
 */
export function useBottomBarVisibility() {
	const [visible, setVisibleState] = useState(currentVisible)

	useEffect(() => {
		const handler = (v: boolean) => setVisibleState(v)
		listeners.add(handler)
		return () => { listeners.delete(handler) }
	}, [])

	return visible
}

export default function useRetractableBottomBar() {
	const lastScrollYRef = useRef(0)
	const isVisibleRef = useRef(true)

	useEffect(() => {
		let ticking = false

		function handleScroll() {
			if (ticking) return
			ticking = true

			window.requestAnimationFrame(() => {
				const currentScrollY = window.document.documentElement.scrollTop
				const delta = currentScrollY - lastScrollYRef.current

				if (delta > SCROLL_DELTA_THRESHOLD && isVisibleRef.current) {
					isVisibleRef.current = false
					setBottomBarVisible(false)
				} else if (delta < -SCROLL_DELTA_THRESHOLD && !isVisibleRef.current) {
					isVisibleRef.current = true
					setBottomBarVisible(true)
				}

				lastScrollYRef.current = Math.max(currentScrollY, 0)
				ticking = false
			})
		}

		window.addEventListener('scroll', handleScroll)

		return () => {
			window.removeEventListener('scroll', handleScroll)
			if (!isVisibleRef.current) {
				isVisibleRef.current = true
				setBottomBarVisible(true)
			}
		}
	}, [])
}
