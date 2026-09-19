import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { View } from 'eitri-luminus'

interface BottomFixedProps {
	children?: ReactNode
	[key: string]: unknown
}

export default function BottomFixed(props: BottomFixedProps) {
	const { children, ...rest } = props
	const [bottomHeight, setBottomHeight] = useState(0)
	useEffect(() => {
		loadHeaderHeight()
	}, [children])
	const waitForElement = (selector: string): Promise<Element | null> => {
		return new Promise(resolve => {
			if (document.querySelector(selector)) {
				return resolve(document.querySelector(selector))
			}
			const observer = new MutationObserver(() => {
				if (document.querySelector(selector)) {
					observer.disconnect()
					resolve(document.querySelector(selector))
				}
			})
			observer.observe(document.body, {
				childList: true,
				subtree: true
			})
		})
	}
	const loadHeaderHeight = async () => {
		await waitForElement('#bottom-fixed')
		const element = document.getElementById('bottom-fixed')
		if (element) {
			const bottomHeight = element.offsetHeight
			setBottomHeight(bottomHeight)
		}
	}
	return (
		<>
			<View
				id='bottom-fixed'
				className='fixed z-100 pb-8 pt-8'>
				{children}
				<View bottomInset />
			</View>
			<View className={`h-${bottomHeight} w-full`} />
		</>
	)
}
