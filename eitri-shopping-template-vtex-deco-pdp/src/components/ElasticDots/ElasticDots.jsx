export default function ElasticDots(props) {

	const { total, current, maxVisible = 7} = props;

	if (total < 2) {
		return
	}

	const getDotScale = (index) => {
		const distance = Math.abs(index - current);
		if (distance === 0) return 1;
		if (distance === 1) return 0.75;
		if (distance === 2) return 0.5;
		return 0.3;
	};

	const getDotOpacity = (index) => {
		const distance = Math.abs(index - current);
		if (distance === 0) return 1;
		if (distance === 1) return 0.85;
		if (distance === 2) return 0.55;
		return 0.3;
	};

	// Sliding window: center the active dot
	const half = Math.floor(maxVisible / 2);
	let start = Math.max(0, current - half);
	let end = start + maxVisible;
	if (end > total) {
		end = total;
		start = Math.max(0, end - maxVisible);
	}

	const visible = Array.from({ length: total }, (_, i) => i).slice(start, end);

	return (
		<View className="flex items-center justify-center gap-[5px] py-2">
			{/* Edge shrink indicator left */}
			{start > 0 && (
				<View
					className={'bg-base-300'}
					style={{
						width: 5,
						height: 6,
						borderRadius: "50%",
						transform: "scale(0.5)",
					}}
				/>
			)}

			{visible.map((index) => {
				const isActive = index === current;
				const scale = getDotScale(index);
				const opacity = getDotOpacity(index);

				return (
					<View
						key={index}
						className={`${isActive ? 'bg-primary w-[36px]' : 'bg-base-300 w-[12px]'} h-[6px] rounded-lg transition-[width,background-color] duration-300 ease-in-out`}
						style={{
							transform: `scale(${scale})`,
							flexShrink: 0,
						}}
					/>
				);
			})}

			{/* Edge shrink indicator right */}
			{end < total && (
				<View
					className={'bg-base-300'}
					style={{
						width: 5,
						height: 6,
						borderRadius: "50%",
						transform: "scale(0.5)",
					}}
				/>
			)}
		</View>
	);
}