import { View } from 'eitri-luminus'
import { HeaderCart, HeaderContentWrapper, HeaderLogo, HeaderSearchIcon } from 'eitri-shopping-template-vtex-deco-shared'
import { useLocalShoppingCart } from '../../providers/LocalCart'
import Eitri from 'eitri-bifrost'
import { goToCartman } from '../../utils/utils'

export default function MainHeader() {
	const { cart } = useLocalShoppingCart()

	const navigateToSearch = () => {
		Eitri.navigation.navigate({
			path: 'Search'
		})
	}

	return (
		<HeaderContentWrapper className='justify-between items-center'>
			<View onClick={goToCartman}>
				<HeaderLogo />
			</View>

			<View className='flex justify-between gap-[12px]'>
				<HeaderSearchIcon onClick={navigateToSearch} />
				<HeaderCart cart={cart ?? undefined} />
			</View>
		</HeaderContentWrapper>
	)
}
