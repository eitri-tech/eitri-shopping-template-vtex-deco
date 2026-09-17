export interface Props {
	/**
	 * @title Título "Registrar"
	 */
	title?: string
	/**
	 * @title Subtítulo ("Informe seu email")
	 */
	subtitle?: string
	/**
	 * @title Label do campo de código
	 */
	formCodeVerification?: string
	/**
	 * @title Botão "Login" (após verificar o código)
	 */
	labelButton?: string
	/**
	 * @title Botão "Enviar código"
	 */
	textSendCode?: string
	/**
	 * @title Botão "Reenviar código"
	 */
	textResendCode?: string
	/**
	 * @title Texto "Já possui conta? Entrar"
	 */
	alreadyHaveAccount?: string
}

// ponytail: seção somente de textos — consumida pela view nativa (SignUp) via
// `useAppPageTexts`. Existe para o Deco montar o formulário de edição no painel.
export default function SignUp(_: Props) {
	return null
}
