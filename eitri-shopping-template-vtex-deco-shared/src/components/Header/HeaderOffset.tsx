import { useEffect, useState } from 'react'
import { View } from 'eitri-luminus'

interface HeaderOffsetProps {
	topInset?: boolean
	// Accepted by callers (e.g. HeaderContentWrapper) but unused here — this component tracks
	// its own height via ResizeObserver on #header-container instead.
	height?: number
}

export default function HeaderOffset(props: HeaderOffsetProps) {
	const { topInset } = props
	const [height, setHeight] = useState(60)

	useEffect(() => {
		const el = document.getElementById('header-container')
		if (!el) return
		const observer = new ResizeObserver(([entry]) => {
			setHeight(entry.contentRect.height)
		})
		observer.observe(el)
		return () => observer.disconnect()
	}, [])

	return (
		<>
			{topInset && <View topInset={'auto'} />}
			<View style={{ minHeight: height }} />
		</>
	)
}
