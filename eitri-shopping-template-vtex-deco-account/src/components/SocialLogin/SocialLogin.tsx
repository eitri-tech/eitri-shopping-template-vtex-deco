import { Image, Text, View } from 'eitri-luminus'
import iconGoogle from '../../assets/images/social_google.svg'
import { useTranslation } from 'eitri-i18n'
import { loginWithGoogle } from '../../services/CustomerService'

interface OAuthProvider {
	providerName?: string
	[key: string]: unknown
}

interface SocialLoginProps {
	handleSocialLogin: (executor: () => Promise<unknown>, providerName: string) => void
	oAuthProviders?: OAuthProvider[]
}

export default function SocialLogin(props: SocialLoginProps) {
	const { handleSocialLogin, oAuthProviders } = props
	const { t } = useTranslation()

	return (
		<View className='flex flex-col gap-3'>
			{oAuthProviders?.some(p => p.providerName === 'Google') && (
				<View
					className='flex flex-row items-center justify-center gap-3 h-12 bg-white rounded border border-gray-300 cursor-pointer'
					onClick={() => handleSocialLogin(loginWithGoogle, 'google')}>
					<Image
						src={iconGoogle}
						width='24px'
						height='24px'
					/>
					<Text className='text-gray-700 font-medium'>{t('authSelect.googleButton')}</Text>
				</View>
			)}
		</View>
	)
}
