import { FiPackage } from 'react-icons/fi'

export default function PackageIcon(props) {
	return (
		<FiPackage
			{...props}
			className={props.className || 'text-primary'}
			size={props.size || 24}
		/>
	)
}
