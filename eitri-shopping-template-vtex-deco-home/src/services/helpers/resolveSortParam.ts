export const resolveSortParam = (sort?: string, useGraphQlMode?: boolean): string => {
	if (useGraphQlMode) {
		if (sort?.startsWith('OrderBy')) return sort
		switch (sort) {
			case 'orders:desc':
				return 'OrderByTopSaleDESC'
			case 'release:desc':
				return 'OrderByReleaseDateDESC'
			case 'discount:desc':
				return 'OrderByBestDiscountDESC'
			case 'price:desc':
				return 'OrderByPriceDESC'
			case 'price:asc':
				return 'OrderByPriceASC'
			case 'name:asc':
				return 'OrderByNameASC'
			case 'name:desc':
				return 'OrderByNameDESC'
			case 'score:desc':
				return 'OrderByScoreDESC'
			default:
				return getDefaultSortParam(useGraphQlMode)
		}
	}
	// `sort` is guaranteed defined here (the guard above can only pass when sort.indexOf(':')
	// produced a real match), but that isn't visible to TS through optional chaining — `?? ''`
	// documents the guarantee without a cast.
	if ((sort?.indexOf(':') ?? -1) > -1) return sort ?? ''
	switch (sort) {
		case 'OrderByTopSaleDESC':
			return 'orders:desc'
		case 'OrderByReleaseDateDESC':
			return 'release:desc'
		case 'OrderByBestDiscountDESC':
			return 'discount:desc'
		case 'OrderByPriceDESC':
			return 'price:desc'
		case 'OrderByPriceASC':
			return 'price:asc'
		case 'OrderByNameASC':
			return 'name:asc'
		case 'OrderByNameDESC':
			return 'name:desc'
		case 'OrderByScoreDESC':
			return 'score:desc'
		default:
			return getDefaultSortParam()
	}
}

export const getDefaultSortParam = (useGraphQlMode?: boolean): string => {
	if (useGraphQlMode) return 'OrderByScoreDESC'
	return 'score:desc'
}
