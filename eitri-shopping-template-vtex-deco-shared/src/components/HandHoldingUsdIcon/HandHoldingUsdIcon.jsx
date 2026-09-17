import { FaHandHoldingUsd } from 'react-icons/fa'

export default function HandHoldingUsdIcon(props) {
	return (
		<FaHandHoldingUsd
			{...props}
			className={props.className || 'text-primary'}
			size={props.size || 24}
		/>
	)
}
