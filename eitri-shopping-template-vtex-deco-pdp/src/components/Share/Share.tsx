import { View } from 'eitri-luminus'
import { TrackingService, ShareIcon } from 'eitri-shopping-template-vtex-deco-shared'
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
			<ShareIcon
				size={28}
				className={'text-primary'}
			/>
		</View>
	)
}
