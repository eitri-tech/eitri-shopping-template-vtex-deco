import { Image, Text, View } from 'eitri-luminus'
import type { ImageWidget } from '../../types/widgets'
import MailIcon from '../../components/MailIcon/MailIcon'
import LockIcon from '../../components/LockIcon/LockIcon'
import { useCmsAuth } from '../../providers/CmsDependencies'

export interface Props {
	/**
	 * @title Subtítulo
	 * @description Frase acima dos botões de login.
	 */
	subtitle?: string
	/**
	 * @title Botão "Receber código por E-mail"
	 */
	emailCodeButton?: string
	/**
	 * @title Botão "Entrar com o Google"
	 */
	googleButton?: string
	/**
	 * @title Ícone do botão Google (opcional)
	 */
	googleIcon?: ImageWidget
	/**
	 * @title Botão "Entrar com E-mail e senha"
	 */
	emailPasswordButton?: string
	/**
	 * @title Ícone do botão E-mail e senha (opcional)
	 */
	emailPasswordIcon?: ImageWidget
	/**
	 * @title Texto "Ainda não possui conta?"
	 */
	noAccountYet?: string
	/**
	 * @title Link "Cadastre-se agora"
	 */
	registerNow?: string
}

export default function WelcomeLoginOptions({
	subtitle,
	emailCodeButton,
	googleButton,
	googleIcon,
	emailPasswordButton,
	emailPasswordIcon,
	noAccountYet,
	registerNow
}: Props) {
	// Handlers/estado resolvidos e injetados pelo app (account) via CmsDependencies.
	const { showGoogle, showEmailPassword, onEmailCode, onGoogle, onEmailPassword, onRegister } = useCmsAuth()

	return (
		<View className='px-4'>
			{subtitle && (
				<View className='mb-6'>
					<Text className='text-center text-sm text-gray-600 leading-5 px-2'>{subtitle}</Text>
				</View>
			)}

			<View className='flex flex-col gap-3'>
				<View
					className='flex flex-row items-center justify-center gap-3 h-12 rounded-lg border border-gray-300'
					onClick={onEmailCode}>
					<MailIcon
						size={20}
						className='text-gray-700'
					/>
					<Text className='text-gray-700 font-medium'>{emailCodeButton}</Text>
				</View>

				{showGoogle && (
					<View
						className='flex flex-row items-center justify-center gap-3 h-12 rounded-lg border border-gray-300'
						onClick={onGoogle}>
						{googleIcon && (
							<Image
								src={googleIcon}
								width='20px'
								height='20px'
							/>
						)}
						<Text className='text-gray-700 font-medium'>{googleButton}</Text>
					</View>
				)}

				{showEmailPassword && (
					<View
						className='flex flex-row items-center justify-center gap-3 h-12 rounded-lg border border-gray-300'
						onClick={onEmailPassword}>
						{emailPasswordIcon ? (
							<Image
								src={emailPasswordIcon}
								width='20px'
								height='20px'
							/>
						) : (
							<LockIcon
								size={20}
								className='text-gray-700'
							/>
						)}
						<Text className='text-gray-700 font-medium'>{emailPasswordButton}</Text>
					</View>
				)}
			</View>

			<View className='mt-5 flex flex-row items-center justify-center gap-1'>
				{noAccountYet && <Text className='text-sm text-gray-600'>{noAccountYet}</Text>}
				<View onClick={onRegister}>
					<Text className='text-sm font-bold text-black underline'>{registerNow}</Text>
				</View>
			</View>
		</View>
	)
}
