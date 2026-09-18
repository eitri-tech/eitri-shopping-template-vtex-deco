export const MOVEMENT_TYPE = {
	RECEIVED: 'received',
	REDEEMED: 'redeemed',
	SPECIAL: 'special'
} as const
export type MovementType = (typeof MOVEMENT_TYPE)[keyof typeof MOVEMENT_TYPE]

export const MOVEMENT_STATUS = {
	NONE: 'none',
	EXPIRING: 'expiring',
	EXPIRED: 'expired',
	PENDING: 'pending'
} as const
export type MovementStatus = (typeof MOVEMENT_STATUS)[keyof typeof MOVEMENT_STATUS]

export const STATEMENT_FILTER = {
	ALL: 'all',
	PENDING: 'pending',
	EXPIRING: 'expiring'
} as const
export type StatementFilter = (typeof STATEMENT_FILTER)[keyof typeof STATEMENT_FILTER]

export interface BonusWallet {
	id?: string
	user_id?: string
	balance?: number
	pending_balance?: number
	created_at?: string
	updated_at?: string
	[key: string]: unknown
}

export interface BonusOrderCashbackDetails {
	generated?: number
	used?: number
	status?: string
	availability_date?: string
	expires_at?: string
	received_at?: string
	[key: string]: unknown
}

export interface BonusOrder {
	ticket?: string
	document?: string
	created_at?: string
	order_details?: {
		status?: string
		total?: number
		[key: string]: unknown
	}
	cashback_details?: BonusOrderCashbackDetails
	[key: string]: unknown
}

export interface BonusIncentiveDetails {
	amount_available?: number
	amount_total?: number
	expires_at?: string
	group?: string
	reason?: string
	status?: string
	type?: string
	[key: string]: unknown
}

export interface BonusIncentive {
	document?: string
	created_at?: string
	incentive_details?: BonusIncentiveDetails
	[key: string]: unknown
}

export interface BonusExtract {
	wallets?: BonusWallet[]
	orders?: BonusOrder[]
	incentives?: BonusIncentive[]
	[key: string]: unknown
}

export interface BonusMovement {
	id: string
	type: MovementType
	status: MovementStatus
	description: string
	date: string
	amount: number
	createdAt: string
}

export interface BonusExpiration {
	amount: number
	days: number
	date: string
}

export interface BonusScreenData {
	customerName: string
	missingCpf: boolean
	balance: number | null
	statement: BonusMovement[]
	expiration: BonusExpiration | null
}

export interface BonusFaqItem {
	id: string
	question: string
	answer?: string
	url?: string
}
