import { FiHelpCircle } from 'react-icons/fi'

interface HelpCircleIconProps {
	className?: string
	size?: number | string
	[key: string]: unknown
}

export default function HelpCircleIcon(props: HelpCircleIconProps) {
	const { className, size, ...rest } = props
	return (
		<FiHelpCircle
			{...rest}
			className={className || 'text-primary'}
			size={size || 24}
		/>
	)
}
