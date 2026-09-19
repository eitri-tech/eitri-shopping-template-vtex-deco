import { useState } from 'react'
import { View, Text } from 'eitri-luminus'
import { useLocalShoppingCart } from '../../providers/LocalCart'
import SimpleCard from '../Card/SimpleCard'
import personalIcon from '../../assets/images/personal.svg'
import { useTranslation } from 'eitri-i18n'
import { navigate } from '../../services/navigationService'
import OtpLogin from '../OtpLogin/OtpLogin'

export default function UserData() {
	const { cart, removeClientData } = useLocalShoppingCart()
	const { t } = useTranslation()

	const [showOtpLogin, setShowOtpLogin] = useState(false)

	const profile = cart?.clientProfileData
	const email = profile?.email ?? ''
	const fullName = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ')

	const clearClientData = async () => {
		try {
			if (cart?.clientProfileData && typeof removeClientData === 'function') {
				await removeClientData()
				navigate('PersonalData')
			}
		} catch (e) {
			console.error('Erro ao limpar dados do cliente', e)
		}
	}

	const goToPersonalData = () => {
		try {
			navigate('PersonalData')
		} catch (e) {
			console.error('Erro ao navegar para a tela de dados pessoais', e)
		}
	}

	const onPressMainAction = () => {
		if (!cart?.canEditData) {
			setShowOtpLogin(true)
		} else {
			goToPersonalData()
		}
	}

	return (
		<>
			<SimpleCard
				title={t('userData.txtPersonData')}
				isFilled={!!email}
				onPress={onPressMainAction}
				icon={personalIcon}>
				<View className='flex flex-col'>
					<View className='flex flex-row justify-between'>
						<Text className='text-xs mb-1'>{email}</Text>
						{email && !cart?.canEditData && (
							<View onClick={clearClientData}>
								<Text className='text-xs text-primary-300 underline'>{t('userData.txtMessageLeave')}</Text>
							</View>
						)}
					</View>
					<Text className='text-xs mb-1'>{fullName}</Text>
					<Text className='text-xs mb-1'>{profile?.document ?? ''}</Text>
					<Text className='text-xs mb-1'>{profile?.phone ?? ''}</Text>
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
