import { Text, View } from 'eitri-luminus'
export default function HeaderSearch(props) {
	const { onPress, labelSearch } = props

	return (
		<View className='w-full'>
			<View className='rounded-full bg-neutral-100 border-neutral-300 border-[1px] flex py-2 pl-4 max-h-[40px] items-center w-full'>
				<svg
					viewBox='0 0 24 24'
					fill='none'
					xmlns='http://www.w3.org/2000/svg'>
					<g
						id='SVGRepo_bgCarrier'
						strokeWidth='0'></g>
					<g
						id='SVGRepo_tracerCarrier'
						strokeLinecap='round'
						strokeLinejoin='round'></g>
					<g id='SVGRepo_iconCarrier'>
						{' '}
						<path
							d='M15.7955 15.8111L21 21M18 10.5C18 14.6421 14.6421 18 10.5 18C6.35786 18 3 14.6421 3 10.5C3 6.35786 6.35786 3 10.5 3C14.6421 3 18 6.35786 18 10.5Z'
							stroke='#000000'
							strokeWidth='2'
							strokeLinecap='round'
							strokeLinejoin='round'></path>{' '}
					</g>
				</svg>
				<Text
					className='ml-1 text-neutral-500 font-baloo2 text-xs font-bold'
					// marginLeft='extra-small'
					// color='neutral-500'
					// fontFamily='Baloo2'
					// fontSize='extra-small'
					// fontWeight='bold'
				>
					{labelSearch || 'Procurar...'}
				</Text>
			</View>
		</View>
	)
}
