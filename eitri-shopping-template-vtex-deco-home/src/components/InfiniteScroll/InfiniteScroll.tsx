import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { View } from 'eitri-luminus'

interface InfiniteScrollProps {
	children?: ReactNode
	onScrollEnd?: () => void
	[key: string]: unknown
}

export default function InfiniteScroll(props: InfiniteScrollProps) {
	const { children, onScrollEnd, ...rest } = props
	const [scrollEnded, setScrollEnded] = useState(false)
	useEffect(() => {
		const handleScroll = () => {
			if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 300) {
				setScrollEnded(true)
			}
		}
		window.addEventListener('scroll', handleScroll)
		return () => {
			window.removeEventListener('scroll', handleScroll)
		}
	}, [])
	useEffect(() => {
		if (scrollEnded) {
			onScrollEnd?.()
		}
		setScrollEnded(false)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [scrollEnded])
	return <View {...rest}>{children}</View>
}
