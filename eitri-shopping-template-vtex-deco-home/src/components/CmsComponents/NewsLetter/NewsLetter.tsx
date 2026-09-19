import { useState } from 'react'
import type { ComponentProps } from 'react'
import { View, Text, TextInput } from 'eitri-luminus'
import { TrackingService, NewsletterService } from 'eitri-shopping-template-vtex-deco-shared'
import { useSnackBar } from '../../../providers/SnackBar'
import { processActions } from '../../../services/ResolveCmsActions'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// TextInputProps deliberately omits `type` from its InputHTMLAttributes — same override already
// applied in SearchInput.tsx and CustomInput.tsx to preserve this input's real `type` usage.
type TextInputWithType = ComponentProps<typeof TextInput> & { type?: string }
const TextInputAny = TextInput as unknown as (props: TextInputWithType) => JSX.Element

interface NewsLetterData {
	title?: string
	subtitle?: string
	emailPlaceholder?: string
	namePlaceholder?: string
	buttonLabel?: string
	page?: string
	termsAction?: any
	privacyAction?: any
	[key: string]: unknown
}

interface NewsLetterProps {
	data?: NewsLetterData
}

export default function NewsLetter(props: NewsLetterProps) {
	const { data } = props
	const { showSnackBar } = useSnackBar()

	const title = data?.title || 'Que bom que você veio!'
	const subtitle = data?.subtitle || 'Cadastre-se na nossa lista VIP e receba primeiro as novidades'
	const emailPlaceholder = data?.emailPlaceholder || 'E-mail'
	const namePlaceholder = data?.namePlaceholder || 'Nome'
	const buttonLabel = data?.buttonLabel || 'Cadastrar'
	const termsAction = data?.termsAction
	const privacyAction = data?.privacyAction

	const [email, setEmail] = useState('')
	const [name, setName] = useState('')
	const [accepted, setAccepted] = useState(false)
	const [isLoading, setIsLoading] = useState(false)

	const isFormValid = EMAIL_REGEX.test(email) && name.trim().length > 0 && accepted

	const handleSubmit = async () => {
		if (!isFormValid || isLoading) return

		try {
			setIsLoading(true)

			const { alreadySubscribed } = await NewsletterService.subscribeToNewsletter({
				name: name.trim(),
				email: email.trim(),
				acceptedTerms: accepted,
				page: data?.page
			})

			TrackingService.sendRecommendedGaEvent('newsletter_subscribe', { email, name })

			showSnackBar?.(
				'success',
				alreadySubscribed ? 'E-mail já cadastrado.' : 'Cadastro realizado com sucesso!'
			)
			setEmail('')
			setName('')
			setAccepted(false)
		} catch (e) {
			console.error('Erro ao cadastrar na newsletter', e)
			showSnackBar?.('trash', 'Não foi possível concluir o cadastro. Tente novamente.')
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<View className='flex flex-col gap-4 px-4 py-6 mt-6 bg-white'>
			<View className='flex flex-col gap-2'>
				<Text className='text-2xl font-bold text-gray-900'>{title}</Text>
				<Text className='text-lg text-gray-800'>{subtitle}</Text>
			</View>

			<TextInputAny
				type='email'
				value={email}
				onChange={(e: any) => setEmail(e?.target?.value ?? '')}
				placeholder={emailPlaceholder}
				className='w-full h-12 px-4 border border-gray-300 border-solid bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0'
			/>

			<TextInputAny
				type='text'
				value={name}
				onChange={(e: any) => setName(e?.target?.value ?? '')}
				placeholder={namePlaceholder}
				className='w-full h-12 px-4 border border-gray-300 border-solid bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0'
			/>

			<View className='flex flex-row items-start gap-2'>
				<View
					onClick={() => setAccepted(!accepted)}
					className={[
						'w-5 h-5 mt-0.5 shrink-0 border border-solid flex items-center justify-center',
						accepted ? 'bg-gray-900 border-gray-900' : 'bg-white border-gray-400'
					].join(' ')}>
					{accepted ? <Text className='text-xs text-white leading-none'>✓</Text> : null}
				</View>
				<Text className='text-sm text-gray-600'>
					Li e concordo com os{' '}
					<Text
						onClick={termsAction ? () => processActions({ action: termsAction } as any) : undefined}
						className='underline text-gray-600'>
						Termos e Condições
					</Text>
					, e com a{' '}
					<Text
						onClick={privacyAction ? () => processActions({ action: privacyAction } as any) : undefined}
						className='underline text-gray-600'>
						Política de Privacidade
					</Text>{' '}
					da loja
				</Text>
			</View>

			<View
				onClick={handleSubmit}
				className={[
					'flex items-center justify-center w-full h-12',
					isFormValid && !isLoading ? 'bg-black' : 'bg-gray-300'
				].join(' ')}>
				<Text
					className={['font-bold', isFormValid && !isLoading ? 'text-white' : 'text-gray-500'].join(' ')}>
					{isLoading ? 'Cadastrando...' : buttonLabel}
				</Text>
			</View>
		</View>
	)
}
