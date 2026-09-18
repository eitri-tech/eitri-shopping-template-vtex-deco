import { View } from 'eitri-luminus'
import Eitri from 'eitri-bifrost'

interface HeaderCloseProps {
	// Note: Eitri.navigation.back(steps) takes a number of screens to go back, not a page identifier.
	// Typed as number to match HeaderReturn convention.
	backPage?: number
	onClick?: () => void
	className?: string
	[key: string]: unknown
}

export default function HeaderClose(props: HeaderCloseProps) {
	const { backPage, onClick, className } = props

	const onClose = () => {
		if (typeof onClick === 'function') {
			return onClick()
		} else {
			if (backPage) {
				Eitri.navigation.back(backPage)
			} else {
				Eitri.navigation.back()
			}
		}
	}

	return (
		<View
			className={`flex items-center ${className || ''}`}
			onClick={onClose}>
			<svg
				xmlns='http://www.w3.org/2000/svg'
				width='24'
				height='24'
				viewBox='0 0 24 24'
				fill='none'
				stroke='currentColor'
				strokeWidth='2'
				strokeLinecap='round'
				strokeLinejoin='round'
				className='text-header-content'>
				<line
					x1='18'
					y1='6'
					x2='6'
					y2='18'></line>
				<line
					x1='6'
					y1='6'
					x2='18'
					y2='18'></line>
			</svg>
		</View>
	)
}
