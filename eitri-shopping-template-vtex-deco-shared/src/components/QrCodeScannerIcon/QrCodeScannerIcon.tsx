import { MdOutlineQrCodeScanner } from 'react-icons/md'

interface QrCodeScannerIconProps {
	className?: string
	size?: number | string
	[key: string]: unknown
}

export default function QrCodeScannerIcon(props: QrCodeScannerIconProps) {
	const { className, size, ...rest } = props
	return (
		<MdOutlineQrCodeScanner
			{...rest}
			className={className || 'text-primary'}
			size={size || 24}
		/>
	)
}
