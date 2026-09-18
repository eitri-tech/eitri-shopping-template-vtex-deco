import { View } from 'eitri-luminus'
import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'

export interface Props {
	children?: ReactNode
	onScrollEnd: () => void
	[key: string]: any
}

export default function InfiniteScroll({ children, onScrollEnd, ...rest }: Props) {
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
			onScrollEnd()
		}
		setScrollEnded(false)
	}, [scrollEnded])

	return <View {...rest}>{children}</View>
}
