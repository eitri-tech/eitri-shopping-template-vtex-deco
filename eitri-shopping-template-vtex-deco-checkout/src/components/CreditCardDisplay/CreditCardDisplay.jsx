import CardIcon from '../Icons/CardIcons/CardIcon'

export default function CreditCardDisplay({ cardInfo, cardName }) {
	// Determinar a cor do cartão baseado na bandeira detectada
	const getCardGradient = brand => {
		const loBrand = brand?.toLowerCase()
		switch (loBrand) {
			case 'visa':
				return 'from-blue-600 via-blue-700 to-blue-800'
			case 'mastercard':
				return 'from-orange-500 via-red-500 to-red-600'
			case 'elo':
				return 'from-green-600 via-green-700 to-green-800'
			case 'amex':
				return 'from-teal-500 via-teal-600 to-teal-700'
			case 'hipercard':
				return 'from-purple-600 via-purple-700 to-purple-800'
			case 'diners':
				return 'from-indigo-600 via-indigo-700 to-indigo-800'
			case 'discover':
				return 'from-orange-600 via-orange-700 to-orange-800'
			default:
				return 'from-slate-600 via-slate-700 to-slate-800'
		}
	}

	return (
		<View
			className={`relative overflow-hidden rounded-lg p-4 bg-gradient-to-br ${getCardGradient(cardName)} shadow-md border border-gray-200 `}
			height={'190'}>
			{/* Efeito de brilho sutil */}
			<View className='absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12' />
			<View className='absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 -translate-x-8' />

			{/* Conteúdo do cartão */}
			<View className='relative z-10 flex flex-col justify-between h-[100%]'>
				{/* Header do cartão */}
				<View className='flex flex-row items-center justify-between'>
					<Text className='text-white/80 text-xs font-medium'>CARTÃO DE CRÉDITO</Text>
					<CardIcon
						width={'20px'}
						iconKey={cardName}
					/>
				</View>

				<View className='flex flex-col justify-between grow-1 gap-4 h-[100%] mt-2'>
					{/* Número do cartão */}
					<View className='flex flex-col'>
						<Text className='text-white/60 text-xs'>Número do cartão</Text>
						<View className='h-[18px]'>
							{cardInfo?.cardNumber && (
								<Text className='text-white text-base font-mono tracking-wider'>
									{cardInfo?.cardNumber}
								</Text>
							)}
						</View>
					</View>

					{/* Informações do titular e validade */}
					<View className='flex flex-row items-end justify-between'>
						<View className='flex flex-col'>
							<Text className='text-white/60 text-xs'>Titular</Text>
							<View className='h-[14px] max-w-[100%]'>
								{cardInfo?.holderName && (
									<Text className='text-white text-sm font-medium truncate'>
										{cardInfo?.holderName}
									</Text>
								)}
							</View>
						</View>
					</View>

					{/* Informações do titular e validade */}
					<View className='flex flex-row items-end justify-between'>
						<View className='flex flex-col'>
							<Text className='text-white/60 text-xs'>Válido até</Text>
							<View className='h-[16px]'>
								{cardInfo?.dueDate && (
									<Text className='text-white text-sm font-medium'>{cardInfo?.dueDate}</Text>
								)}
							</View>
						</View>

						<View className='flex flex-col items-end'>
							<Text className='text-white/60 text-xs'>CVV</Text>
							<View className='h-[16px]'>
								{cardInfo?.validationCode && (
									<Text className='text-white text-sm font-medium'>{cardInfo?.validationCode}</Text>
								)}
							</View>
						</View>
					</View>
				</View>
			</View>
		</View>
	)
}
