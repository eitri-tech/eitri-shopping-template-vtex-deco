import { TfiArrowRight } from 'react-icons/tfi'

export default function ArrowRightIcon(props) {
	return (
		<TfiArrowRight
			{...props}
			className={props.className || 'text-primary'}
			size={props.size || 24}
		/>
	)
}
