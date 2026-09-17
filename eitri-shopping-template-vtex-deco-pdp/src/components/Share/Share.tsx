import { View } from 'eitri-luminus'
import { TrackingService } from 'eitri-shopping-template-vtex-deco-shared'
import { FiShare2 } from 'react-icons/fi'
import { Vtex } from 'eitri-shopping-vtex-shared'
import Eitri from 'eitri-bifrost'
import type { VtexProduct } from '../../types/vtex'

interface ShareProps {
	product?: VtexProduct
}

export default function Share(props: ShareProps) {
	const { product } = props

	const shareLink = () => {
		const url = `${Vtex?.configs?.host}/${product?.linkText}/p?utm_source=eitri-shop-source`
		Eitri.share.link({
			url: url
		})
		TrackingService.shareEvent(product?.linkText ?? '')
	}

	return (
		<View onClick={shareLink}>
			<FiShare2
				size={28}
				className={'text-primary'}
			/>
		</View>
	)
}
