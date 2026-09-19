import { View, Text } from 'eitri-luminus'
import Eitri from 'eitri-bifrost'
import { CopyIcon, CheckIcon } from 'eitri-shopping-template-vtex-deco-shared'
import { useState, useEffect } from 'react'

interface OverHeaderData {
	promotionalText?: string
	couponCode?: string
}

interface OverHeaderProps {
	data?: OverHeaderData
}

export default function OverHeader(props: OverHeaderProps) {
	const { data } = props
	const promotionalText = data?.promotionalText
	const couponCode = data?.couponCode

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
		<View className='fixed bottom-0 left-0 right-0 z-[9800]'>
			<View
				className='bg-black flex flex-row items-center justify-center px-4 py-2 gap-2'
				onClick={handleCopy}>
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
			<View
				bottomInset={'auto'}
				className='w-full bg-black'
			/>
		</View>
	)
}
