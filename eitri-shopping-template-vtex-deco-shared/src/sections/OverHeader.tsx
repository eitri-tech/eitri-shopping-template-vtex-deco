import { View, Text } from 'eitri-luminus'
import { useState, useEffect } from 'react'
import Eitri from 'eitri-bifrost'
import CopyIcon from '../components/CopyIcon/CopyIcon'
import CheckIcon from '../components/CheckIcon/CheckIcon'
import { useBottomBarVisibility } from '../hooks/useRetractableBottomBar'

export interface Props {
	/**
	 * @title Texto promocional.
	 */
	promotionalText?: string
	/**
	 * @title Código do cupom.
	 * @description Exibido em destaque; ao tocar na barra, o código é copiado.
	 */
	couponCode?: string
}

export default function OverHeader({ promotionalText, couponCode }: Props) {
	const bottomBarVisible = useBottomBarVisibility()
	const [copied, setCopied] = useState(false)
	const [replayingTransition, setReplayingTransition] = useState(false)

	useEffect(() => {
		setCopied(false)
		setReplayingTransition(false)
	}, [couponCode])

	if (!promotionalText && !couponCode) return null

	const handleCopy = async () => {
		if (!couponCode) return
		await Eitri.clipboard.setText({ text: couponCode })

		if (copied) {
			setReplayingTransition(true)
			setCopied(false)
			return
		}

		setCopied(true)
		setTimeout(() => setCopied(false), 2000)
	}

	const handleIconTransitionEnd = () => {
		if (!replayingTransition) return

		if (!copied) {
			setCopied(true)
			return
		}

		setReplayingTransition(false)
	}

	return (
		<View className={`fixed bottom-0 left-0 right-0 z-[9800] transition-transform duration-300 ${bottomBarVisible ? 'translate-y-0' : 'translate-y-1/2'}`}>
			<View
				className='bg-black flex items-center justify-center px-4 py-2'
				onClick={handleCopy}>
				<View className={`flex flex-row items-center justify-center gap-2 transition-transform duration-300 ${bottomBarVisible ? 'translate-y-0' : 'translate-y-2'}`}>
					{promotionalText ? (
						<Text className='text-white text-xs leading-none font-medium tracking-widest uppercase whitespace-nowrap flex-shrink-0'>
							{promotionalText}
						</Text>
					) : null}
					{promotionalText && couponCode ? (
						<Text className='text-white text-xs leading-none mx-1 whitespace-nowrap flex-shrink-0'>•</Text>
					) : null}
					{couponCode ? (
						<View className='flex flex-row items-center gap-2 flex-shrink-0'>
							<View className='flex items-center border border-dashed border-white px-2 py-0.5'>
								<Text className='text-white text-xs leading-none font-bold tracking-widest uppercase whitespace-nowrap'>
									{couponCode}
								</Text>
							</View>
							<View className='relative ml-2 w-[20px] h-[20px]'>
								<View
									onTransitionEnd={handleIconTransitionEnd}
									className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${copied ? 'opacity-60' : 'opacity-0'}`}>
									<CheckIcon
										size={25}
										color='white'
									/>
								</View>
								<View
									className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${copied ? 'opacity-0' : 'opacity-60'}`}>
									<CopyIcon
										size={25}
										color='white'
									/>
								</View>
							</View>
						</View>
					) : null}
				</View>
			</View>
			<View
				bottomInset={'auto'}
				className='w-full bg-black'
			/>
		</View>
	)
}
