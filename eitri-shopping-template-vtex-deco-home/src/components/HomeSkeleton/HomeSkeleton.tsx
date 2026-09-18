import { Lottie, View } from 'eitri-luminus'
import animationData from '../../../public/assets/loading.json'

interface HomeSkeletonProps {
	show?: boolean
}

export default function HomeSkeleton(props: HomeSkeletonProps) {
	const { show } = props
	return (
		<View className={`fixed inset-0 z-50 flex justify-center items-center bg-white transition-opacity duration-[5000ms] ${show ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
			<Lottie
				autoPlay
				loop
				src={animationData}
			/>
		</View>
	)
}
