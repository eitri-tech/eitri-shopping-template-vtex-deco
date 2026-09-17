import { View } from 'eitri-luminus'
import { Loading } from 'eitri-shopping-template-vtex-deco-shared'

interface ProductCardLoadingProps {
	width?: string | number
	gap?: string | number
}

// LoadingComponent doesn't declare an `inline` prop — kept as-is (pre-existing, likely a no-op).
const LoadingAny = Loading as unknown as (props: Record<string, unknown>) => JSX.Element

export default function ProductCardLoading(props: ProductCardLoadingProps) {
	const { width, gap } = props
	return (
		<View className='flex justify-center'>
			<View className='p-8 pr-1 w-[50%]'>
				<View className='min-h-341 p-2 border-neutral-content border'>
					<View className='flex flex-col justify-center items-center p-2'>
						<LoadingAny
							inline
							width='80px'
						/>
					</View>
				</View>
			</View>
			<View
				width='50%'
				className='p-8 pl-1'>
				<View
					minHeight='341px'
					className='p-2 border-neutral-content border'>
					<View className='flex flex-col justify-center items-center p-2'>
						<LoadingAny
							inline
							width='80px'
						/>
					</View>
				</View>
			</View>
		</View>
	)
}
