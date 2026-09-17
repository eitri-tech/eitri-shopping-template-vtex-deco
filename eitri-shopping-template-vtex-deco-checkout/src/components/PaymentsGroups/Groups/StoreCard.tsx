import { useLocalShoppingCart } from '../../../providers/LocalCart'
import GroupsWrapper from './GroupsWrapper'
import Card from '../../../components/Icons/MethodIcons/Card'
import { navigate } from '../../../services/navigationService'

interface StoreCardProps {
	systemGroup?: unknown
}

export default function StoreCard(props: StoreCardProps) {
	const { setCardInfo } = useLocalShoppingCart()

	const { systemGroup } = props

	const addNewCard = () => {
		setCardInfo?.(null)
		navigate('StoreCardForm', { systemGroup })
	}

	return (
		<GroupsWrapper
			title='Cartão da loja'
			icon={<Card />}
			onPress={addNewCard}
		/>
	)
}
