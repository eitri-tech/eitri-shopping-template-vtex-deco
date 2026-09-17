import { CustomButton } from 'eitri-shopping-template-vtex-deco-shared'
import { View, Text } from 'eitri-luminus'
import { useTranslation } from 'eitri-i18n'

export default function ModalConfirm(props) {
	const { showModal, removeItem, closeModal } = props
	const { t } = useTranslation()

	if (!showModal) return null

	return (
		<View
			className='z-[9999] !bg-black/70 !opacity-100 fixed inset-0 flex items-center justify-center'
			onClick={() => {
				if (typeof onClose === 'function') onClose()
			}}>
			<View className='flex flex-col p-4 bg-base-100 items-center rounded w-11/12 max-w-xs mx-auto'>
				<Text className='text-center text-lg font-bold mb-6 text-base-content'>
					{props.message || t('modalConfirm.deleteAddress')}
				</Text>
				<View className='flex flex-col gap-3 w-full'>
					<CustomButton
						label={t('modalConfirm.confirm')}
						className='btn-error btn-block'
						onClick={removeItem}
					/>
					<CustomButton
						variant='outlined'
						label={t('modalConfirm.cancel')}
						onClick={closeModal}
					/>
				</View>
			</View>
		</View>
	)
}
