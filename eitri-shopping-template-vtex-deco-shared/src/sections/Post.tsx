import { Text, View, Image } from 'eitri-luminus'
import type { ImageWidget } from '../types/widgets'

export interface Props {
	/**
	 * @title Post image.
	 */
	photo?: ImageWidget
	/**
	 * @title Post body.
	 * @format textarea
	 */
	post: string
	/**
	 * @title Publish date.
	 * @format datetime
	 */
	datetime: string
	/**
	 * @title Post title.
	 */
	title: string
}

export default function Post({ title, photo, datetime, post }: Props) {
	return (
		<View className='flex flex-col items-center justify-center gap-2 p-4 border rounded shadow-md'>
			{photo && (
				<Image
					src={photo}
					alt={`${title} image`}
					height={300}
					width={300}
					className='rounded'
				/>
			)}
			<Text className='font-bold text-lg text-primary'>{title}</Text>
			<Text>Published at: {datetime}</Text>
			<Text>This is an example section</Text>
			<Text>{post}</Text>
		</View>
	)
}
