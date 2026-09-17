import { Image, View } from 'eitri-luminus'
import { getRemoteAppConfigProperty } from '../../utils/getRemoteConfigStyleProperty'
export default function HeaderLogo(props) {
	const { src } = props

	const [urlLogo, setUrlLogo] = useState('')

	useEffect(() => {
		getConfigs()
	}, [])

	const getConfigs = async () => {
		try {
			if (src) {
				setUrlLogo(src)
			} else {
				const headerLogo = await getRemoteAppConfigProperty('headerLogo')
				setUrlLogo(headerLogo)
			}
		} catch (error) {
			console.error('Erro ao obter configurações remotas:', error)
		}
	}

	if (!urlLogo) {
		return null
	}

	return (
		<View className='max-h-[40px] max-w-[150px] flex items-center'>
			<Image
				src={urlLogo}
				className='max-h-[40px] max-w-[150px]'
			/>
		</View>
	)
}
