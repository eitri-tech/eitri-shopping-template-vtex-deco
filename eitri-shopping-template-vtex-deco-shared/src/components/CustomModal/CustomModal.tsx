import { View } from 'eitri-luminus'
import type { ReactNode } from 'react'

export interface Props {
	children?: ReactNode
	open?: boolean
	onClose?: () => void
}

export default function CustomModal({ children, open, onClose }: Props) {
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
