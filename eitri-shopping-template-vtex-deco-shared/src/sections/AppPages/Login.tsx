export interface Props {
	/**
	 * @title Título "Entrar com email e senha"
	 * @description Texto exibido no cabeçalho da tela de login.
	 */
	title?: string
	/**
	 * @title Subtítulo
	 * @description Frase abaixo do título ("Insira seu email e senha abaixo").
	 */
	subtitle?: string
	/**
	 * @title Código · Título
	 * @description Texto exibido no cabeçalho ao entrar com código de acesso.
	 */
	accessCodeTitle?: string
	/**
	 * @title Código · Subtítulo
	 * @description Texto exibido abaixo do título ao entrar com código de acesso.
	 */
	accessCodeSubtitle?: string
	/**
	 * @title Label do campo de e-mail
	 */
	formEmail?: string
	/**
	 * @title Label do campo de senha
	 */
	formPass?: string
	/**
	 * @title Botão "Entrar"
	 */
	labelButton?: string
	/**
	 * @title Botão "Login com código de acesso"
	 */
	labelAccessWithCode?: string
	/**
	 * @title Link "Esqueceu a senha?"
	 */
	forgotPass?: string
	/**
	 * @title Texto "Ainda não possui conta?"
	 */
	noAccountYet?: string
	/**
	 * @title Link "Cadastre-se agora"
	 */
	registerNow?: string

	// --- Modo "código de acesso por e-mail" ---
	/**
	 * @title Código · Label do campo de código
	 */
	formCodeVerification?: string
	/**
	 * @title Código · Botão "Enviar código"
	 */
	textSendCode?: string
	/**
	 * @title Código · Botão "Reenviar código"
	 */
	textResendCode?: string
	/**
	 * @title Código · Botão "Entrar com senha"
	 */
	labelLoginWithPass?: string
}

// ponytail: seção somente de textos — consumida pela view nativa (SignIn) via
// `useAppPageTexts`. Existe para o Deco montar o formulário de edição no painel.
export default function Login(_: Props) {
	return null
}
