import { MdOutlineQrCodeScanner } from 'react-icons/md'

export default function QrCodeScannerIcon(props) {
	return (
		<MdOutlineQrCodeScanner
			{...props}
			className={props.className || 'text-primary'}
			size={props.size || 24}
		/>
	)
}
