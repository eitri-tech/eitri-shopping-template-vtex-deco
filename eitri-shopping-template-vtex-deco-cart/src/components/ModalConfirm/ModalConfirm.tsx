import type { MouseEvent } from 'react'
import { CustomButton } from 'eitri-shopping-template-vtex-deco-shared'
import { View, Text, Modal } from 'eitri-luminus'
import { useTranslation } from 'eitri-i18n'

interface ModalConfirmProps {
	text?: string
	showModal?: boolean
	removeItem?: () => void
	closeModal?: () => void
}

export default function ModalConfirm(props: ModalConfirmProps) {
	const { t } = useTranslation()
	const { text, showModal, removeItem, closeModal } = props

	if (!showModal) return null

	return (
		<View
			className='z-[9999] !bg-black/70 !opacity-100 fixed inset-0 flex items-center justify-center'
			// Original referenced an undeclared `onClose` here (a no-op typo — `typeof onClose`
			// on an unbound identifier never throws, it just silently does nothing on overlay
			// click). `closeModal` is this component's actual close handler.
			onClick={(e?: MouseEvent<HTMLElement>) => {
				if (typeof closeModal === 'function') closeModal()
			}}>
			<View className='flex flex-col p-4 bg-base-100 items-center w-11/12 max-w-xs mx-auto'>
				<Text className='text-center text-lg font-bold mb-6 text-base-content'>{text}</Text>
				<View className='flex flex-col gap-3 w-full'>
					<CustomButton
						label={t('modal.confirm.delete')}
						className='btn-error btn-block'
						onClick={removeItem}
					/>
					<CustomButton
						variant='outlined'
						label={t('modal.confirm.cancel')}
						onClick={closeModal}
					/>
				</View>
			</View>
		</View>
	)
}
