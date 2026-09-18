import { Image } from 'eitri-luminus'
import storeBagIcon from '../../assets/icons/storebag.png'

export default function StoreBagIcon(props) {
	return (
		<Image
			src={storeBagIcon}
			width={props.size || 24}
			height={props.size || 24}
			className={props.className || 'object-contain'}
		/>
	)
}
