import {
	HeaderContentWrapper,
	HeaderReturn,
	HeaderText,
	Loading,
	BottomInset,
	GenericBox,
	CustomButton,
	CreditCardIcon,
	TrashIcon
} from 'eitri-shopping-monte-carlo-shared'
import ProtectedView from '../components/ProtectedView/ProtectedView'
import ModalConfirm from '../components/ModalConfirm/ModalConfirm'
import { getSavedCards, deleteSavedCard } from '../services/CustomerService'
import { navigate, PAGES } from '../services/NavigationService'
import { sendScreenView } from '../services/TrackingService'
import { useTranslation } from 'eitri-i18n'

const CardItem = ({ card, onDelete }) => {
	const { t } = useTranslation()
	return (
		<GenericBox className='p-4 mb-3'>
			<View className='flex items-center justify-between'>
				<View className='flex items-center gap-3'>
					<CreditCardIcon
						size={24}
						className='text-gray-500'
					/>
					<View className='flex flex-col gap-0.5'>
						<Text className='font-semibold text-sm'>{card.paymentSystemName}</Text>
						<Text className='text-gray-500 text-xs'>{card.cardNumber}</Text>
						<Text className={`text-xs ${card.isExpired ? 'text-red-500' : 'text-gray-400'}`}>
							{t('savedCards.expires')} {card.expirationDate}
							{card.isExpired ? ` • ${t('savedCards.expired')}` : ''}
						</Text>
					</View>
				</View>
				<View onClick={() => onDelete(card)}>
					<TrashIcon
						size={20}
						className='text-red-400'
					/>
				</View>
			</View>
		</GenericBox>
	)
}

export default function SavedCards(props) {
	const { t } = useTranslation()
	const [cards, setCards] = useState([])
	const [isLoading, setIsLoading] = useState(true)
	const [showDeleteModal, setShowDeleteModal] = useState(false)
	const deletingCard = useRef(null)

	useEffect(() => {
		sendScreenView('Cartões salvos', 'SavedCards')
		loadCards()
	}, [])

	const loadCards = async () => {
		setIsLoading(true)
		try {
			const data = await getSavedCards()
			setCards(data)
		} catch (e) {
			console.error('SavedCards: failed to load', e)
		}
		setIsLoading(false)
	}

	const handleDelete = card => {
		deletingCard.current = card
		setShowDeleteModal(true)
	}

	const confirmDelete = async () => {
		if (!deletingCard.current) return
		setShowDeleteModal(false)
		const id = deletingCard.current.id
		setCards(prev => prev.filter(c => c.id !== id))
		deletingCard.current = null
		try {
			await deleteSavedCard(id)
		} catch (e) {
			console.error('SavedCards: failed to delete', e)
			loadCards()
		}
	}

	return (
		<ProtectedView afterLoginRedirectTo='SavedCards'>
			<Page title='Cartões salvos' topInset>
				<HeaderContentWrapper>
					<HeaderReturn />
					<HeaderText text={t('savedCards.title')} />
				</HeaderContentWrapper>

				<Loading
					isLoading={isLoading}
					fullScreen
				/>

				{!isLoading && (
					<View className='p-4'>
						{cards.length === 0 ? (
							<View className='flex flex-col items-center py-12 gap-3'>
								<CreditCardIcon
									size={40}
									className='text-gray-300'
								/>
								<Text className='text-gray-500'>{t('savedCards.empty')}</Text>
							</View>
						) : (
							cards.map(card => (
								<CardItem
									key={card.id}
									card={card}
									onDelete={handleDelete}
								/>
							))
						)}

						{/*<CustomButton*/}
						{/*	label={t('savedCards.addCard')}*/}
						{/*	onClick={() => navigate(PAGES.ADD_CARD_FORM)}*/}
						{/*/>*/}
					</View>
				)}

				<BottomInset />

				<ModalConfirm
					showModal={showDeleteModal}
					message={t('savedCards.confirmDelete')}
					removeItem={confirmDelete}
					closeModal={() => setShowDeleteModal(false)}
				/>
			</Page>
		</ProtectedView>
	)
}
