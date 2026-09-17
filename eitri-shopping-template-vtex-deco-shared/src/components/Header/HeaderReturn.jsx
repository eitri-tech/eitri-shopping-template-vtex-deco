import Eitri from 'eitri-bifrost'
import ArrowLeftIcon from '../ArrowLeftIcon/ArrowLeftIcon'

export default function HeaderReturn(props) {
	const { backPage, onClick, className } = props

	const onBack = () => {
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
			className={`flex items-center ${className}`}
			onClick={onBack}>
			<ArrowLeftIcon
				size={24}
				className='text-header-content'
			/>
		</View>
	)
}
