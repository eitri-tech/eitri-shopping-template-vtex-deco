import Eitri from 'eitri-bifrost'
import { HeaderCart, HeaderContentWrapper, HeaderReturn } from 'eitri-shopping-template-vtex-deco-shared'
import { useLocalShoppingCart } from '../../providers/LocalCart'

export default function Header(props) {
	const { cart } = useLocalShoppingCart()

	const handleSearch = term => {
		console.log('search term: ', term)
		Eitri.nativeNavigation.open({
			slug: 'home',
			initParams: { route: 'Search', searchTerm: term }
		})
	}

	return (
		<HeaderContentWrapper className='justify-between gap-3'>
			<HeaderReturn />
			<HeaderCart cart={cart} />
		</HeaderContentWrapper>
	)
}
