import Pix from './MethodIcons/Pix'
import Boleto from './MethodIcons/Boleto'
import Card from './MethodIcons/Card'

interface MethodIconProps {
	iconKey?: string
}

export default function MethodIcon(props: MethodIconProps) {
	const { iconKey } = props

	if (iconKey === 'Boleto Bancário') {
		return <Boleto />
	}

	if (iconKey === 'Pix') {
		return <Pix />
	}

	if (iconKey === 'Cartão de Crédito') {
		return <Card />
	}

	return null
}
