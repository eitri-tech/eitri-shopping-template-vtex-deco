import { navigate, PAGES } from '../../services/NavigationService'
import { useTranslation } from 'eitri-i18n'
import { CustomButton, GenericBox } from 'eitri-shopping-template-vtex-deco-shared'

export default function LoginCard(props) {
	const { t } = useTranslation()

	return (
		<View className='p-4'>
			<GenericBox className='flex flex-col gap-4 p-4 w-full'>
				<View className='flex flex-col gap-1'>
					<Text className='text-lg font-bold text-gray-800'>{t('loginCard.lbOpen')}</Text>
					<Text className='text-gray-600 leading-relaxed'>{t('loginCard.infoPage')}</Text>
				</View>
				<CustomButton
					label={t('loginCard.lbButton')}
					onPress={() => navigate(PAGES.SIGNIN, { redirectTo: 'Home' })}
				/>
			</GenericBox>
		</View>
	)
}
