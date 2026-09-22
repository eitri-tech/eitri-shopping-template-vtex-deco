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
		} else if (backPage) {
			Eitri.navigation.back(backPage)
		} else {
			// Only the no-arg call closes the Eitri-App at its root screen; back(1) there is a silent no-op.
			Eitri.navigation.back()
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
