// /Users/calindra/Workspace/Eitri/eitri-shopping-template/shopping-vtex-template-account/src/components/SocialLogin/SocialLogin.jsx
import iconFacebook from '../../assets/images/social_facebook.svg'
import iconGoogle from '../../assets/images/social_google.svg'
import { useTranslation } from 'eitri-i18n'
import { loginWithFacebook, loginWithGoogle } from '../../services/CustomerService'

export default function SocialLogin(props) {
	const { handleSocialLogin, oAuthProviders } = props
	const { t } = useTranslation()

	const onSocialLogin = async executor => {
		try {
			console.log('onSocialLogin')
			await executor()
			handleSocialLogin()
		} catch (e) {
			console.log('Error on social login:', e)
		}
	}

	return (
		<View className='flex flex-col gap-3'>
			{oAuthProviders?.some(p => p.providerName === 'Google') && (
				<View
					className='flex items-center justify-center gap-3 h-12 bg-white rounded border border-gray-300 p-2 cursor-pointer'
					onClick={() => onSocialLogin(loginWithGoogle)}>
					<Image
						src={iconGoogle}
						width='24px'
						height='24px'
					/>
					<Text className='text-gray-700 font-bold uppercase text-sm'>{t('socialLogin.lbButton')}</Text>
				</View>
			)}

			{oAuthProviders?.some(p => p.providerName === 'Facebook') && (
				<View
					className='flex items-center justify-center gap-3 bg-[#3D5A98] rounded h-12 p-2 cursor-pointer'
					onClick={() => onSocialLogin(loginWithFacebook)}>
					<Image
						src={iconFacebook}
						width='24px'
						height='24px'
					/>
					<Text className='text-white font-bold uppercase text-sm'>{t('socialLogin.lbButtonFacebook')}</Text>
				</View>
			)}
		</View>
	)
}
