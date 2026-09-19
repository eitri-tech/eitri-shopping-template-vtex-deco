import { View, Text } from 'eitri-luminus'
import type { ReactNode } from 'react'

// Text has no `fontFamily` prop in its .d.ts — kept as-is (pre-existing, likely a no-op at runtime).
const TextAny = Text as unknown as (props: Record<string, unknown> & { children?: ReactNode }) => JSX.Element

export interface Props {
	title?: string
	className?: string
}

export default function SectionTitle({ title, className }: Props) {
	if (!title) return null

	return (
		<View className={`mb-2 px-4 ${className || ''}`}>
			<TextAny
				fontFamily='Inter'
				className='font-semibold text-2xl text-black'>
				{title}
			</TextAny>
		</View>
	)
}
