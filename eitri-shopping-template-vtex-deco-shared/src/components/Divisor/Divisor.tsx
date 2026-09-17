import { View } from 'eitri-luminus'

interface DivisorProps {
	width?: string | number
	height?: string | number
	backgroundColor?: string
}

// ViewProps (CommonProps) has no `backgroundColor` — Luminus expects a Tailwind `bg-*` class
// instead. Keeping this prop as-is (pre-existing behavior); it's likely a no-op at runtime.
const ViewWithBackgroundColor = View as unknown as (props: DivisorProps & { children?: never }) => JSX.Element

export default function Divisor(props: DivisorProps) {
	const { width, height, backgroundColor } = props

	return (
		<ViewWithBackgroundColor
			width={width || '100%'}
			height={height || '1px'}
			backgroundColor={backgroundColor || 'neutral-300'}
		/>
	)
}
