import { useTranslation } from 'eitri-i18n'
import { Text, View } from 'eitri-luminus'
export default function PristineView() {
	const { t } = useTranslation()
	return (
		<View className='flex justify-center items-center h-[100vh]'>
			<Text className='text-lg text-neutral-content font-bold'>{t('pristineView.content')}</Text>
		</View>
	)
}
