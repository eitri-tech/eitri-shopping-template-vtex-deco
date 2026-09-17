import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import Eitri from 'eitri-bifrost'
import { isLoggedIn } from '../../services/CustomerService'
import { useTranslation } from 'eitri-i18n'
import { Loading } from 'eitri-shopping-template-vtex-deco-shared'

interface ProtectedViewProps {
	afterLoginRedirectTo?: string
	redirectState?: Record<string, unknown>
	labelLoading?: string
	children?: ReactNode
}

export default function ProtectedView(props: ProtectedViewProps) {
	const { afterLoginRedirectTo, redirectState, children } = props
	const { t } = useTranslation()

	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		async function checkIfUserIsLogged() {
			setIsLoading(true)
			const logged = await isLoggedIn()

			if (!logged) {
				Eitri.navigation.navigate({
					path: 'SignIn',
					replace: true,
					state: { redirectTo: afterLoginRedirectTo, redirectState: redirectState }
				})
			}

			return setIsLoading(false)
		}

		checkIfUserIsLogged()
	}, [])

	if (isLoading) {
		return <Loading fullScreen />
	}

	return <>{children}</>
}
