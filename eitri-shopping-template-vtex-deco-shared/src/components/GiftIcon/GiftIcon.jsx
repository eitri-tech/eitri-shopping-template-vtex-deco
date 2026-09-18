import { GoGift } from 'react-icons/go'
import { View } from 'eitri-luminus'

export default function GiftIcon(props) {
	const { filled, className, size = 26 } = props

	if (filled) {
		return (
			<View
				className={`inline-flex items-center justify-center bg-black rounded-[9px] p-[6px] ${className || ''}`}>
				<GoGift
					className='text-white'
					size={`${size}px`}
				/>
			</View>
		)
	}

	return (
		<GoGift
			className={className || 'text-primary'}
			size={`${size}px`}
		/>
	)
}
