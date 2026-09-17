import { View, Text, Button } from 'eitri-luminus'
import { MinusIcon, PlusIcon } from 'eitri-shopping-template-vtex-deco-shared'

export default function Quantity(props) {
	const { quantity, handleItemQuantity, disable } = props

	return (
		<View className='flex items-center border border-gray-500 rounded-lg px-2'>
			<View
				className='w-1/3 flex items-center justify-center'
				onClick={() => quantity > 1 && handleItemQuantity(-1)}>
				<MinusIcon className={`${quantity === 1 || disable ? 'text-gray-300' : 'text-primary'}`} />
			</View>

			<Text className='px-3 py-2 text-sm font-medium min-w-[3rem] text-center'>{quantity}</Text>

			<View
				className='w-1/3 items-center justify-center pl-1'
				onClick={() => handleItemQuantity(1)}>
				<PlusIcon className={`${disable ? 'text-gray-300' : 'text-primary'}`} />
			</View>
		</View>
	)
}
