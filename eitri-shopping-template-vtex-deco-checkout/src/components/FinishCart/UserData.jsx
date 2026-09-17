import { useLocalShoppingCart } from '../../providers/LocalCart'
import SimpleCard from '../Card/SimpleCard'
import personalIcon from '../../assets/images/personal.svg'
import { useTranslation } from 'eitri-i18n'
import { navigate } from '../../services/navigationService'
import OtpLogin from '../OtpLogin/OtpLogin'
import { GenericBox } from 'eitri-shopping-template-vtex-deco-shared'

export default function UserData(props) {
	const { cart, removeClientData } = useLocalShoppingCart()
	const { t } = useTranslation()

	const [showOtpLogin, setShowOtpLogin] = useState(false)

	const clearClientData = async () => {
		try {
			if (cart?.clientProfileData) {
				await removeClientData()
				navigate('PersonalData')
			}
		} catch (e) {
			console.log('Erro ao limpar dados do cliente', e)
		}
	}

	const goToPersonalData = () => {
		try {
			navigate('PersonalData')
		} catch (e) {
			console.log('Erro ao navegar para a tela de dados pessoais', e)
		}
	}

	const onPressMainAction = async () => {
		try {
			if (!cart?.canEditData) {
				setShowOtpLogin(true)
			} else {
				goToPersonalData()
			}
		} catch (e) {
			console.log('Erro ao navegar para a tela de dados pessoais', e)
		}
	}

	return (
		<>
			<SimpleCard
				title={t('userData.txtPersonData')}
				isFilled={cart?.clientProfileData?.email}
				onPress={onPressMainAction}
				icon={personalIcon}>
				<View className='flex flex-col'>
					<View className='flex flex-row justify-between'>
						<Text className='text-xs mb-1'>{cart?.clientProfileData?.email}</Text>
						{cart?.clientProfileData?.email && !cart.canEditData && (
							<View onClick={clearClientData}>
								<Text className='text-xs text-primary-300 underline'>
									{t('userData.txtMessageLeave')}
								</Text>
							</View>
						)}
					</View>
					<Text className='text-xs mb-1'>{`${cart?.clientProfileData?.firstName} ${cart?.clientProfileData?.lastName}`}</Text>
					<Text className='text-xs mb-1'>{cart?.clientProfileData?.document}</Text>
					<Text className='text-xs mb-1'>{cart?.clientProfileData?.phone}</Text>
				</View>
			</SimpleCard>
			<OtpLogin
				open={showOtpLogin}
				onClose={() => setShowOtpLogin(false)}
				onLogged={goToPersonalData}
			/>
		</>
	)
}
