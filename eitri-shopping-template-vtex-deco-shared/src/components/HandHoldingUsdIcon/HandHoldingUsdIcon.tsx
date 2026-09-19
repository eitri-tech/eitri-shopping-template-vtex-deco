import { FaHandHoldingUsd } from 'react-icons/fa'

interface HandHoldingUsdIconProps {
	className?: string
	size?: number | string
	[key: string]: unknown
}

export default function HandHoldingUsdIcon(props: HandHoldingUsdIconProps) {
	const { className, size, ...rest } = props
	return (
		<FaHandHoldingUsd
			{...rest}
			className={className || 'text-primary'}
			size={size || 24}
		/>
	)
}
