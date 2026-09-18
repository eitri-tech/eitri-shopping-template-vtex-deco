import type { RouteProps } from '../types/route'
import SignInVariant from './SignInVariant'

interface AuthSelectProps extends RouteProps {
	[key: string]: unknown
}

export default function AuthSelect(props: AuthSelectProps) {
	return (
		<SignInVariant
			{...props}
			defaultAfterLogin='back'
		/>
	)
}
