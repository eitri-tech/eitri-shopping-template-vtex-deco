import { View } from 'eitri-luminus'
import Eitri from 'eitri-bifrost'

interface HeaderReturnProps {
	// Eitri.navigation.back(steps) takes a number of screens to go back, not a page identifier.
	backPage?: number
	onClick?: () => void
	className?: string
}

export default function HeaderReturn(props: HeaderReturnProps) {
	const { backPage, onClick, className } = props

	const onBack = () => {
		if (typeof onClick === 'function') {
			return onClick()
		} else {
			// The .d.ts declares `steps` as required even though the JSDoc/examples treat it as
			// optional — 1 matches the documented single-screen-back example.
			Eitri.navigation.back(backPage ?? 1)
		}
	}

	return (
		<View
			className={`flex items-center ${className}`}
			onClick={onBack}>
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
				<polyline points='15 18 9 12 15 6'></polyline>
			</svg>
		</View>
	)
}
