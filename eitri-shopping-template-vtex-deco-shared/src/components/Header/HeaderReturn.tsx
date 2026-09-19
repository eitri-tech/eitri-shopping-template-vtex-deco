import { View } from 'eitri-luminus'
import Eitri from 'eitri-bifrost'
import ArrowLeftIcon from '../ArrowLeftIcon/ArrowLeftIcon'

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
			<ArrowLeftIcon
				size={24}
				className='text-header-content'
			/>
		</View>
	)
}
