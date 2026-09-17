import Eitri from 'eitri-bifrost'
import { useState, useEffect } from 'react'
import { GenericBox } from 'eitri-shopping-template-vtex-deco-shared'
import { FiCopy } from 'react-icons/fi'
import OrderStatusBadge from '../OrderStatusBadge/OrderStatusBadge'
import { formatDateDaysMonthYear, formatPriceInCents } from '../../utils/utils'
import { getOrderById } from '../../services/CustomerService'
import ImageCard from '../Image/ImageCard'
import { navigate, PAGES } from '../../services/NavigationService'
import OrderBuyAgain from '../OrderBuyAgain/OrderBuyAgain'
import { useSnackBar } from '../../providers/SnackBar'
import { useTranslation } from 'eitri-i18n'

export default function OrderCard(props) {
	const { order } = props
	const { showSnackBar } = useSnackBar()
	const { t } = useTranslation()

	const [loadingDetails, setLoadingDetails] = useState(false)
	const [orderDetail, setOrderDetails] = useState(null)

	useEffect(() => {
		loadDetails()
	}, [order])

	const loadDetails = async () => {
		setLoadingDetails(true)
		try {
			const result = await getOrderById(order?.orderId)
			setOrderDetails(result)
		} catch (e) {
			console.error('Falha ao carregar detalhes do pedido:', e)
		} finally {
			setLoadingDetails(false)
		}
	}

	const handleCopyOrderId = async () => {
		Eitri.clipboard.setText({ text: order?.orderId })
		showSnackBar('success', t('orderCard.copySuccess'))
	}

	const openOrderDetails = () => {
		if (orderDetail) {
			navigate(PAGES.ORDER_DETAILS, { order: orderDetail })
		} else {
			navigate(PAGES.ORDER_DETAILS, { order: order.orderId })
		}
	}

	return (
		<GenericBox>
			{/* Header: ID + status */}
			<View className='flex items-start justify-between'>
				<View className='flex flex-col gap-1'>
					<View className='flex items-center gap-1.5'>
						<Text className='text font-bold'>#{order?.orderId}</Text>
						<View onClick={handleCopyOrderId}>
							<FiCopy
								className='text-gray-700'
								size={12}
							/>
						</View>
					</View>
					<Text className='text-sm text-gray-800'>{formatDateDaysMonthYear(order?.creationDate)}</Text>
				</View>
				{orderDetail && (
					<OrderStatusBadge
						order={orderDetail}
						statusId={order?.status}
						statusDescription={order?.statusDescription}
					/>
				)}
			</View>

			{/* Thumbnails dos produtos */}
			{loadingDetails ? (
				<View className='py-4'>
					<Text className='text-xs text-gray-400'>{t('orderCard.loading')}</Text>
				</View>
			) : (
				orderDetail?.items?.length > 0 && (
					<View className='flex gap-2 py-4 overflow-x-auto'>
						{orderDetail.items.map(item => (
							<View
								key={item.uniqueId}
								className='w-[56px] h-[56px] flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 border border-gray-100'>
								<ImageCard
									imageUrl={item.imageUrl}
									className='w-full h-full object-cover'
								/>
							</View>
						))}
					</View>
				)
			)}

			{/* Rodapé: total + ações */}
			{orderDetail && (
				<View className='border-t border-gray-100'>
					<View className='flex items-center justify-between py-4'>
						<Text className='text-xs text-gray-800'>
							{t(order?.totalItems > 1 ? 'orderCard.totalPlural' : 'orderCard.totalSingular', {
								count: order?.totalItems
							})}
						</Text>
						<Text className='text-base font-bold text-gray-900'>
							{formatPriceInCents(order?.totalValue)}
						</Text>
					</View>

					<View className='flex flex-col gap-2 mt-2'>
						<OrderBuyAgain order={orderDetail} />
						<View
							className='w-full flex justify-center py-2'
							onClick={openOrderDetails}>
							<Text className='text font-semibold text-primary'>{t('orderCard.details')}</Text>
						</View>
					</View>
				</View>
			)}
		</GenericBox>
	)
}
