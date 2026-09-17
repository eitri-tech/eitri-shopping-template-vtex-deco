import { Image } from 'eitri-luminus'
import pixIcon from '../../assets/icons/pix.png'

export default function PixIcon(props) {
	return (
		<Image
			src={pixIcon}
			width={props.size || 24}
			height={props.size || 24}
			className={props.className || 'object-contain'}
		/>
	)
}
