import { FiFileText } from 'react-icons/fi'

interface FileTextIconProps {
	className?: string
	size?: number | string
	[key: string]: unknown
}

export default function FileTextIcon(props: FileTextIconProps) {
	const { className, size, ...rest } = props
	return (
		<FiFileText
			{...rest}
			className={className || 'text-primary'}
			size={size || 24}
		/>
	)
}
