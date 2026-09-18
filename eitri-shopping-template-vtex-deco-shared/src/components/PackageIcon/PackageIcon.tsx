import { FiPackage } from 'react-icons/fi'

interface PackageIconProps {
	className?: string
	size?: number | string
	[key: string]: unknown
}

export default function PackageIcon(props: PackageIconProps) {
	const { className, size, ...rest } = props
	return (
		<FiPackage
			{...rest}
			className={className || 'text-primary'}
			size={size || 24}
		/>
	)
}
