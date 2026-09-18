import { HEADER_VARIANT, HeaderContentWrapper, HeaderLogo, HeaderSearchIcon } from 'eitri-shopping-template-vtex-deco-shared'
import Eitri from 'eitri-bifrost'
import { View } from 'eitri-luminus'
import { goToCartman } from '../../utils/utils'

export default function MainHeader() {
	const navigateToSearch = () => {
		Eitri.navigation.navigate({
			path: 'Search'
		})
	}

	return (
		<HeaderContentWrapper
			variant={HEADER_VARIANT.FIXED}
			scrollEffect
			blurOnScroll
			reserveSpace={false}
			hideAfterViewportHeights={0.5}
			className='items-center'>
			<View
				className='absolute left-1/2 -translate-x-1/2 flex items-center justify-center'
				onClick={goToCartman}>
				<HeaderLogo />
			</View>

			<View className='flex justify-between gap-[12px] ml-auto'>
				<HeaderSearchIcon onClick={navigateToSearch} />
			</View>
		</HeaderContentWrapper>
	)
}
