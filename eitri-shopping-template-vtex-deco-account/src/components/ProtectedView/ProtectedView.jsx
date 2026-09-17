import Eitri from 'eitri-bifrost'
import { isLoggedIn } from '../../services/CustomerService'
import { Loading } from 'eitri-shopping-monte-carlo-shared'

export default function ProtectedView(props) {
	const { afterLoginRedirectTo, redirectState } = props

	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		async function checkIfUserIsLogged() {
			setIsLoading(true)
			const logged = await isLoggedIn()

			if (!logged) {
				Eitri.navigation.navigate({
					path: '/AuthSelect',
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

	return <>{props.children}</>
}
