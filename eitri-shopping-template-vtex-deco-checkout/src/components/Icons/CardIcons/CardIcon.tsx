import { Image } from 'eitri-luminus'
import VisaSvg from './Networks/Visa.svg'
import MastercardSvg from './Networks/Mastercard.svg'
import HipercardSvg from './Networks/Hipercard.svg'
import EloSvg from './Networks/Elo.svg'
import DinersSvg from './Networks/Diners.svg'
import AmericanExpressSvg from './Networks/AmericanExpress.svg'
import GooglePayIcon from './../../../assets/images/GPay_Acceptance_Mark_800.png'
import storeCard from './../../../assets/images/card-store.svg'

interface CardIconProps {
	iconKey?: string
	width?: string | number
	height?: string | number
	className?: string
}

const NETWORK_ICONS: Record<string, string> = {
	Visa: VisaSvg,
	Mastercard: MastercardSvg,
	'American Express': AmericanExpressSvg,
	Hipercard: HipercardSvg,
	Elo: EloSvg,
	Diners: DinersSvg
}

export default function CardIcon(props: CardIconProps) {
	const { iconKey, width, height, className = '' } = props

	if (iconKey === 'WH Google Pay') {
		return (
			<Image
				src={GooglePayIcon}
				className={`w-[100px] rounded ${className}`}
			/>
		)
	}

	if (iconKey === 'Cartão da Loja') {
		return (
			<Image
				src={storeCard}
				width={width}
				height={height}
				className={`aspect-[856/540] rounded ${className}`}
			/>
		)
	}

	const icon = iconKey ? NETWORK_ICONS[iconKey] : undefined
	if (!icon) {
		return null
	}

	return (
		<Image
			src={icon}
			width={width}
			height={height}
			className={`aspect-[39/25] rounded ${className}`}
		/>
	)
}
