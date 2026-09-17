import Eitri from 'eitri-bifrost'
import { View, Text, Image } from 'eitri-luminus'
import { useTranslation } from 'eitri-i18n'
import {
	HeaderContentWrapper,
	HeaderReturn,
	HeaderText,
	CustomButton,
	BottomInset,
	TrackingService
} from 'eitri-shopping-template-vtex-deco-shared'
import { IoBagOutline } from 'react-icons/io5'
import { useLocalShoppingCart } from '../providers/LocalCart'

export default function EmptyCart(props) {
	const openWithBottomBar = props?.location?.state?.openWithBottomBar

	const { t } = useTranslation()
	const { startCart } = useLocalShoppingCart()

	useEffect(() => {
		TrackingService.sendScreenView('Carrinho vazio', 'EmptyCart')
	}, [])

	useEffect(() => {
		Eitri.navigation.setOnResumeListener(async () => {
			const cart = await startCart()
			if (cart && cart.items?.length > 0) {
				Eitri.navigation.navigate({ path: 'Home', replace: true })
			}
		})
	}, [])

	const closeEitriApp = () => {
		Eitri.navigation.close()
	}

	return (
		<Page title='Carrinho vazio'>
			<View className={'min-h-[100vh] flex flex-col'}>
				<HeaderContentWrapper>
					{!openWithBottomBar && <HeaderReturn />}
					<HeaderText text={t('home.title')} />
				</HeaderContentWrapper>

				<View className='flex flex-1 flex-col justify-center items-center'>
					<View className='flex flex-col items-center gap-4 w-full max-w-xs'>
						<IoBagOutline
							size={50}
							className={'text-primary'}
						/>
						<Text className='font-bold text-gray-800 text-xl text-center'>
							{t('emptyCart.txtEmptyCart')}
						</Text>
						<Text className='text-gray-600 text-center'>{t('emptyCart.txtMessageList')}</Text>
						{!openWithBottomBar && (
							<View className='w-full mt-2'>
								<CustomButton
									label={t('emptyCart.labelButton')}
									onPress={closeEitriApp}
									className='btn-primary w-full'
								/>
							</View>
						)}
					</View>
					<BottomInset />
				</View>
			</View>
		</Page>
	)
}
