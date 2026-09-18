import { createContext, useContext, useState } from 'react'
import type { ComponentType, ReactNode } from 'react'
import { View } from 'eitri-luminus'
import { TrashIcon, CheckIcon, CloseIcon } from 'eitri-shopping-template-vtex-deco-shared'

type SnackBarType = 'success' | 'trash'

interface SnackBarTypeConfig {
	color: string
	icon: ComponentType<{ className?: string; size?: number }>
}

interface SnackBarContextValue {
	showSnackBar: (type: SnackBarType, inputMessage: string) => void
}

const SnackBar = createContext<SnackBarContextValue>({} as SnackBarContextValue)

export default function SnackBarComponent({ children }: { children?: ReactNode }) {
	const [showSnackbar, setShowSnackbar] = useState(false)
	const [isVisible, setIsVisible] = useState(false)
	const [currentType, setCurrentType] = useState<SnackBarTypeConfig | null>(null)
	const [message, setMessage] = useState<string | null>(null)

	const TYPES: Record<SnackBarType, SnackBarTypeConfig> = {
		success: {
			color: 'success-500',
			icon: CheckIcon
		},
		trash: {
			color: 'urgent-500',
			icon: TrashIcon
		}
	}

	const showSnackBar = (type: SnackBarType, inputMessage: string) => {
		const _type = TYPES[type]
		if (!_type) return

		setCurrentType(_type)
		setShowSnackbar(true)
		setMessage(inputMessage)

		setTimeout(() => setIsVisible(true), 200)
		setTimeout(() => handleClose(), 4000)
	}

	const handleClose = () => {
		setIsVisible(false)
		setTimeout(() => setShowSnackbar(false), 220)
	}

	const getIcon = () => {
		if (!currentType) {
			return null
		}
		const Component = currentType?.icon
		return <Component className={``} />
	}

	return (
		<SnackBar.Provider
			value={{
				showSnackBar
			}}>
			{children}
			<View
				style={{
					display: showSnackbar ? 'block' : 'none'
				}}
				className={`fixed bottom-[70px] left-0 right-0 z-[9900] p-4`}>
				<View
					style={{
						opacity: isVisible ? 1 : 0,
						transform: isVisible ? 'translateY(0)' : 'translateY(100%)'
					}}
					className={
						'transition-[opacity,transform] duration-[200ms,400ms] ease-out bg-gray-800 text-white rounded-lg h-[48px] flex items-center overflow-hidden'
					}>
					{
						<View
							className={`bg-${currentType?.color} w-[50px] h-full flex rounded-l-lg items-center justify-center`}>
							{getIcon()}
						</View>
					}

					<View
						className={'h-full text-white rounded-r-lg w-full flex items-center justify-between gap-2 p-4'}>
						<View>{message}</View>
						<View onClick={handleClose}>
							<CloseIcon size={12} />
						</View>
					</View>
				</View>
				<View
					bottomInset={'auto'}
					className={'w-full'}
				/>
			</View>
		</SnackBar.Provider>
	)
}
export function useSnackBar() {
	const context = useContext(SnackBar)
	return context
}
