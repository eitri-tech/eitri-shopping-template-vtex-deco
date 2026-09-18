import { View } from 'eitri-luminus'
import CategoryPageItem, { CategoryNavItem } from './components/CategoryPageItem'
import { processActions } from '../../../services/ResolveCmsActions'

interface CategoryListSwipeData {
	content?: CategoryNavItem[]
}

interface CategoryListSwipeProps {
	data?: CategoryListSwipeData
}

export default function CategoryListSwipe(props: CategoryListSwipeProps) {
	const { data } = props

	const openItem = (item: CategoryNavItem) => {
		processActions(item)
	}

	return (
		<View className='flex flex-col p-4 gap-4 w-screen max-w-screen overflow-x-hidden'>
			{data?.content &&
				data?.content?.map(item => (
					<CategoryPageItem
						key={item.title}
						item={item}
						goToItem={openItem}
					/>
				))}
			<View
				bottomInset={'auto'}
				className='w-full'
			/>
		</View>
	)
}
