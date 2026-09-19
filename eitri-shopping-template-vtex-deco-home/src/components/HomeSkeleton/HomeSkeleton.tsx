import { Lottie, View } from 'eitri-luminus'
import animationData from '../../../public/assets/loading.json'

// Luminus's Lottie wraps @lottiefiles/react-lottie-player, whose real `src` prop accepts raw
// animation JSON as well as a URL string — the local .d.ts only declares `string`.
const LottieAny = Lottie as unknown as (props: Record<string, unknown>) => JSX.Element

interface HomeSkeletonProps {
	show?: boolean
}

export default function HomeSkeleton(props: HomeSkeletonProps) {
	const { show } = props
	return (
		<View className={`fixed inset-0 z-50 flex justify-center items-center bg-white transition-opacity duration-[5000ms] ${show ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
			<LottieAny
				autoPlay
				loop
				src={animationData}
			/>
		</View>
	)
}
