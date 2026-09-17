import { useLocalShoppingCart } from '../../../providers/LocalCart'
import GroupsWrapper from './GroupsWrapper'
import Card from '../../../components/Icons/MethodIcons/Card'
import { navigate } from '../../../services/navigationService'

export default function StoreCard(props) {
	const { setCardInfo } = useLocalShoppingCart()

	const { systemGroup } = props

	const addNewCard = async () => {
		setCardInfo(null)
		navigate('StoreCardForm', { systemGroup })
	}

	return (
		<>
			<GroupsWrapper
				title='Cartão da loja'
				showArrow={true}
				icon={<Card />}
				onPress={addNewCard}></GroupsWrapper>
		</>
	)
}
