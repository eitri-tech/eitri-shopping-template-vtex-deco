export interface Props {
	/**
	 * @title Título do cabeçalho
	 */
	title?: string
}

// ponytail: seção somente de texto — consumida pela view nativa (SignInVariant) via
// `useAppPageTexts`. Existe para o Deco montar o formulário de edição no painel.
export default function WelcomeHeader(_: Props) {
	return null
}
