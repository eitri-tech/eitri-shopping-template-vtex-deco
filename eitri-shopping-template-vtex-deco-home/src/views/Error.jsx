import Eitri from 'eitri-bifrost'
import { GenericError, TrackingService } from 'eitri-shopping-template-vtex-deco-shared'
export default function Error() {
	useEffect(() => {
		TrackingService.sendScreenView('Erro', 'Error')
	}, [])

	const navigateToHome = () => {
		Eitri.navigation.navigate({
			path: 'Home'
		})
	}

	return (
		<Page
			title='Erro'
			topInset
			bottomInset>
			<GenericError onPress={navigateToHome} />
		</Page>
	)
}
