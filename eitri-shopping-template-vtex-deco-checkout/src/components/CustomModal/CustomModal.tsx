import type { ReactNode } from 'react'
import { View } from 'eitri-luminus'

interface CustomModalProps {
	children?: ReactNode
	open?: boolean
	onClose?: () => void
	[key: string]: unknown
}

export default function CustomModal(props: CustomModalProps) {
	const { children, open, onClose } = props

	if (!open) return null

	return (
		<View
			className='z-[9999] !bg-black/70 !opacity-100 fixed inset-0 flex items-end justify-center'
			onClick={() => {
				if (typeof onClose === 'function') onClose()
			}}>
			{children}
		</View>
	)
}
