import { FaChevronRight } from 'react-icons/fa'
import { GenericBox } from 'eitri-shopping-template-vtex-deco-shared'

export default function CardSelector(props) {
	const { children, mainTitle, mainClickHandler, secondaryActionHandler, secondaryActionTitle } = props

	return (
		<GenericBox className='p-4 mt-4'>
			<View
				onClick={mainClickHandler}
				className='flex flex-col'>
				<View className='flex flex-row items-center justify-between mb-1 gap-2'>
					<Text className='font-bold text-lg block'>{mainTitle}</Text>
					<FaChevronRight className='text-primary w-[24px]' />
				</View>
				{children}
			</View>

			<View className='border-b my-4'></View>

			<View onClick={secondaryActionHandler}>
				<Text className='text-primary font-bold'>{secondaryActionTitle}</Text>
			</View>
		</GenericBox>
	)
}
