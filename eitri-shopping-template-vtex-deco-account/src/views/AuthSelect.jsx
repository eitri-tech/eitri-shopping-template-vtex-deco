import SignInVariant from './SignInVariant'

export default function AuthSelect(props) {
	return (
		<SignInVariant
			{...props}
			defaultAfterLogin='back'
		/>
	)

}
