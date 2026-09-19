import { LuTag } from 'react-icons/lu'

interface TagIconProps {
	className?: string
	size?: number | string
	[key: string]: unknown
}

export default function TagIcon(props: TagIconProps) {
	const { className, size, ...rest } = props
	return (
		<LuTag
			{...rest}
			className={className || 'text-primary'}
			size={size || 24}
		/>
	)
}
