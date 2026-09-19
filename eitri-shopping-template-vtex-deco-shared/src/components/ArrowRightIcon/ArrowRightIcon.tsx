import { TfiArrowRight } from 'react-icons/tfi'

interface ArrowRightIconProps {
	className?: string
	size?: number | string
	[key: string]: unknown
}

export default function ArrowRightIcon(props: ArrowRightIconProps) {
	const { className, size, ...rest } = props
	return (
		<TfiArrowRight
			{...rest}
			className={className || 'text-primary'}
			size={size || 24}
		/>
	)
}
