import { getMappedComponent } from '../../utils/getMappedComponent'
import Eitri from 'eitri-bifrost'
import { View } from 'eitri-luminus'

export default function CmsContentRender(props) {
	const { cmsContent, className, ...rest } = props

	const [key, setKey] = useState(new Date().getTime())

	useEffect(() => {
		if (cmsContent) {
			Eitri.navigation.addOnResumeListener(() => {
				const currentTime = new Date().getTime()
				setKey(currentTime)
			})
		}
	}, [cmsContent])

	return (
		<View className={`gap-6 flex flex-col pb-4 ${className || ''}`}>
			{cmsContent?.map(content => getMappedComponent(content, key, rest))}
		</View>
	)
}
