import Eitri from 'eitri-bifrost'
import { fetchBonusExtract, BONUS_API_ERROR } from './BonusExtractService'

/**
 * Meu Bônus — balance / statement / expiration / FAQ data.
 *
 * Balance, statement ("extrato") and expiration warning are all sourced from
 * the Monte Carlo bonus gateway (see BonusExtractService). Only the FAQ
 * content and help links remain static copy — there's no API for those.
 *
 * Gateway response shape (amounts are integer CENTS):
 *   wallets[]:    { id, user_id, balance, pending_balance, created_at, updated_at }
 *                 available balance = balance - pending_balance.
 *   orders[]:     { ticket, document, created_at, order_details: { status, total, ... },
 *                   cashback_details: { generated, used, status, availability_date,
 *                   expires_at, received_at } }
 *                 canceled orders (cashback_details.status === 'canceled') are
 *                 excluded from the statement — their cashback never settles.
 *   incentives[]: { document, created_at, incentive_details: { amount_available,
 *                   amount_total, expires_at, group, reason, status, type } }
 */

export { BONUS_API_ERROR }

export const MOVEMENT_TYPE = {
	RECEIVED: 'received',
	REDEEMED: 'redeemed',
	SPECIAL: 'special'
}

export const MOVEMENT_STATUS = {
	NONE: 'none',
	EXPIRING: 'expiring',
	EXPIRED: 'expired',
	PENDING: 'pending'
}

export const STATEMENT_FILTER = {
	ALL: 'all',
	PENDING: 'pending',
	EXPIRING: 'expiring'
}

const DAY_IN_MS = 24 * 60 * 60 * 1000
const EXPIRING_SOON_DAYS = 7

// Gateway amounts are integers in CENTS.
const centsToReais = cents => (Number.isFinite(Number(cents)) ? Number(cents) / 100 : 0)

const parseIsoDate = isoDate => {
	if (!isoDate) return null
	// Accepts both date-only ("2026-12-31") and full ISO datetime
	// ("2026-08-11T14:59:31Z") strings — only the former needs a local-midnight
	// anchor to avoid shifting a day when the browser's timezone isn't UTC.
	const date = isoDate.includes('T') ? new Date(isoDate) : new Date(`${isoDate}T00:00:00`)
	return Number.isNaN(date.getTime()) ? null : date
}

// "18 jul 2026" — compact statement-row date.
const formatMovementDate = isoDate => {
	const date = parseIsoDate(isoDate)
	if (!date) return ''
	const day = String(date.getDate()).padStart(2, '0')
	const month = date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')
	return `${day} ${month} ${date.getFullYear()}`
}

// "07 de agosto" — expiration banner date (no year, matches the approved design).
const formatExpirationDate = isoDate => {
	const date = parseIsoDate(isoDate)
	if (!date) return ''
	const day = String(date.getDate()).padStart(2, '0')
	const month = date.toLocaleDateString('pt-BR', { month: 'long' })
	return `${day} de ${month}`
}

// A received amount within EXPIRING_SOON_DAYS of its `expires_at` is flagged
// EXPIRING; past it, EXPIRED. `fallback` covers everything else (e.g. a
// pending incentive, or an order with no expiry data at all).
const deriveExpiryStatus = (isoExpiresAt, fallback = MOVEMENT_STATUS.NONE) => {
	const expiresAt = parseIsoDate(isoExpiresAt)
	if (!expiresAt) return fallback
	const daysLeft = Math.ceil((expiresAt.getTime() - Date.now()) / DAY_IN_MS)
	if (daysLeft < 0) return MOVEMENT_STATUS.EXPIRED
	if (daysLeft <= EXPIRING_SOON_DAYS) return MOVEMENT_STATUS.EXPIRING
	return fallback
}

// An order can carry cashback earned (`generated`) and/or cashback redeemed
// against it (`used`) — each becomes its own statement row when present.
// Only the earned side can expire; a redemption is a settled debit.
const orderToMovements = order => {
	const details = order.cashback_details || {}
	const description = `Pedido: ${order.ticket || ''}`
	const date = formatMovementDate(order.created_at)
	const movements = []

	if (details.generated > 0) {
		movements.push({
			id: `order-${order.ticket}-received`,
			type: MOVEMENT_TYPE.RECEIVED,
			status: deriveExpiryStatus(details.expires_at),
			description,
			date,
			amount: centsToReais(details.generated),
			createdAt: order.created_at || ''
		})
	}

	if (details.used > 0) {
		movements.push({
			id: `order-${order.ticket}-redeemed`,
			type: MOVEMENT_TYPE.REDEEMED,
			status: MOVEMENT_STATUS.NONE,
			description,
			date,
			amount: -centsToReais(details.used),
			createdAt: order.created_at || ''
		})
	}

	return movements
}

// "done" is the only status observed in production so far; anything else
// (e.g. a future "pending"/"expired") falls back to NONE rather than guessing.
const INCENTIVE_STATUS_TO_MOVEMENT_STATUS = {
	done: MOVEMENT_STATUS.NONE,
	pending: MOVEMENT_STATUS.PENDING,
	expired: MOVEMENT_STATUS.EXPIRED
}

const incentiveToMovement = (incentive, index) => {
	const details = incentive.incentive_details || {}
	const baseStatus = INCENTIVE_STATUS_TO_MOVEMENT_STATUS[details.status] ?? MOVEMENT_STATUS.NONE
	return {
		id: `incentive-${incentive.created_at || index}`,
		type: MOVEMENT_TYPE.SPECIAL,
		status: baseStatus === MOVEMENT_STATUS.NONE ? deriveExpiryStatus(details.expires_at, baseStatus) : baseStatus,
		description: details.reason || details.group || 'Incentivo',
		date: formatMovementDate(incentive.created_at),
		amount: centsToReais(details.amount_available ?? details.amount_total),
		createdAt: incentive.created_at || ''
	}
}

const toStatement = extract => {
	const settledOrders = (extract?.orders || []).filter(order => order?.cashback_details?.status !== 'canceled')
	const movements = [...settledOrders.flatMap(orderToMovements), ...(extract?.incentives || []).map(incentiveToMovement)]
	return movements.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
}

// Available balance (REAIS) for the wallet, or null when the gateway has no
// wallet on file — distinct from a genuine R$0 balance. `pending_balance` is
// held/not-yet-spendable, so the spendable amount is balance - pending.
const toBalance = extract => {
	const wallet = extract?.wallets?.[0]
	if (!wallet || wallet.balance == null) return null
	return centsToReais(wallet.balance) - centsToReais(wallet.pending_balance)
}

// The wallet carries no expiration fields — the soonest-expiring available
// incentive stands in for the banner instead.
//
// Must filter to incentives that haven't expired yet (daysLeft >= 0): sorting
// the raw `expires_at` ascending and taking [0] picks the OLDEST record in the
// whole history, not the closest upcoming one — every already-expired
// incentive sorts before any future one. Combined with the old `Math.max(0, …)`
// clamp (which silently turned "expired 2 years ago" into "0 days left"), that
// bug surfaced a stale, long-dead incentive as "expires today" for a real
// customer whose actual soonest expiration was months away — the amount shown
// wasn't even related to the current wallet balance.
const toExpiration = extract => {
	const now = Date.now()
	const upcoming = (extract?.incentives || [])
		.map(incentive => incentive?.incentive_details)
		.filter(details => details && details.status === 'done' && details.amount_available > 0 && details.expires_at)
		.map(details => ({ details, expirationDate: parseIsoDate(details.expires_at) }))
		.filter(({ expirationDate }) => expirationDate && Math.ceil((expirationDate.getTime() - now) / DAY_IN_MS) >= 0)
		.sort((a, b) => a.expirationDate.getTime() - b.expirationDate.getTime())[0]

	if (!upcoming) return null

	const { details, expirationDate } = upcoming
	const days = Math.ceil((expirationDate.getTime() - now) / DAY_IN_MS)

	return {
		amount: centsToReais(details.amount_available),
		days,
		date: formatExpirationDate(details.expires_at)
	}
}

const onlyDigits = value => String(value || '').replace(/\D/g, '')

// Caches the whole screen payload (name/balance/statement/expiration), not
// just the raw gateway extract — the Bonus screen's spinner is gated on the
// auth check + customer profile fetch that happen *before* the extract call,
// so caching only the extract still left every visit blocked on those. See
// `peekCachedBonusScreenData` for the instant, no-network read that lets the
// Bonus screen render straight from this cache before it even re-verifies
// auth.
const BONUS_CACHE_KEY = 'bonus-screen-cache'

// Cross-app flag (Eitri's `{ shared: true }` storage namespace, NOT the
// regular per-app one — see the eitri-bifrost Storage docs) — the checkout
// app stamps this on order completion (see its bonusRedeemService), since
// redeeming/earning cashback there changes the wallet behind this app's back
// and there's no other way for this app to learn that happened while it
// isn't the one running. Must stay byte-for-byte identical to the key used
// in checkout's bonusRedeemService.notifyBonusChanged.
const BONUS_CACHE_INVALIDATION_FLAG_KEY = 'bonus-cache-invalidate-after'

const readCachedScreenData = async () => {
	try {
		return await Eitri.storage.getItemJson(BONUS_CACHE_KEY)
	} catch (e) {
		console.error('[Bonus] failed to read cached screen data', e)
		return null
	}
}

const writeCachedScreenData = async (cpf, data) => {
	try {
		await Eitri.storage.setItemJson(BONUS_CACHE_KEY, { cpf, data, cachedAt: Date.now() })
	} catch (e) {
		console.error('[Bonus] failed to cache screen data', e)
	}
}

const isCacheStale = async cached => {
	try {
		const invalidateAfter = await Eitri.storage.getItem(BONUS_CACHE_INVALIDATION_FLAG_KEY, { shared: true })
		return !!invalidateAfter && Number(invalidateAfter) > cached.cachedAt
	} catch (e) {
		return false
	}
}

/**
 * Drops the cached bonus screen data so the next `loadBonusScreenData` call
 * hits the gateway again instead of serving stale data. Call this whenever
 * the shopper's wallet may have changed since the cache was written but this
 * app has no reliable signal that it did — e.g. right after the account app
 * is freshly opened (a background app switch or purchase in another
 * eitri-app could have changed the balance meanwhile).
 */
export const invalidateBonusCache = async () => {
	try {
		await Eitri.storage.removeItem(BONUS_CACHE_KEY)
	} catch (e) {
		console.error('[Bonus] failed to invalidate cache', e)
	}
}

/**
 * Instant, no-network read of whatever is currently cached for the Bonus
 * screen — customer name, balance, statement and expiration warning, exactly
 * as `loadBonusScreenData` last resolved them. Returns `null` when there's
 * nothing usable (never loaded yet, or invalidated).
 *
 * This intentionally does NOT check which CPF the cache belongs to (the
 * caller doesn't know the current customer's CPF yet without first awaiting
 * a network call, which is the very thing this exists to avoid) — it's meant
 * for optimistic hydration only: render this immediately, then let the
 * normal `loadBonusScreenData` call (which does check the CPF) reconcile it
 * with the real, verified customer shortly after. On the very rare
 * shared-device account switch, this means the wrong customer's balance can
 * flash for one round trip before being corrected — never persists past that.
 * @returns {Promise<{ customerName: string, missingCpf: boolean, balance: number|null, statement: object[], expiration: object|null } | null>}
 */
export const peekCachedBonusScreenData = async () => {
	const cached = await readCachedScreenData()
	if (!cached || (await isCacheStale(cached))) return null
	return cached.data
}

/**
 * Cache-first: loads the data the Bonus screen needs — customer name,
 * balance, statement and expiration warning — from the Monte Carlo bonus
 * gateway. Also doubles as the preload entry point: the account Home screen
 * calls this right after fetching the customer profile for its own "Meu
 * Bônus" balance card, which warms this same cache — so by the time the
 * shopper taps into the Bonus screen, `peekCachedBonusScreenData` above
 * usually already has something to show instantly.
 *
 * The cache is reused as-is until something explicitly invalidates it —
 * either this app calling `invalidateBonusCache()` (see account Home.jsx, on
 * a fresh app open) or the cross-app flag checkout stamps when an order
 * finishes (see `isCacheStale`/`BONUS_CACHE_INVALIDATION_FLAG_KEY` above).
 * There is no time-based expiry beyond that.
 *
 * Gateway/network failures (timeout, 5xx, offline, ...) are rethrown rather
 * than degraded to an empty result — a genuine "no balance" customer and a
 * failed gateway call must stay distinguishable to callers, otherwise the UI
 * can't tell them apart and shows the wrong empty/error state.
 * @param {{ document?: string, firstName?: string }} customer
 * @returns {Promise<{ customerName: string, missingCpf: boolean, balance: number|null, statement: object[], expiration: object|null }>}
 * @throws {Error} with a `code` from BONUS_API_ERROR when the gateway call fails
 */
export const loadBonusScreenData = async customer => {
	const customerName = customer?.firstName || ''
	const document = onlyDigits(customer?.document)

	if (!document) {
		return { customerName, missingCpf: true, balance: null, statement: [], expiration: null }
	}

	const cached = await readCachedScreenData()
	if (cached && cached.cpf === document && !(await isCacheStale(cached))) {
		return { ...cached.data, customerName }
	}

	const extract = await fetchBonusExtract(document)
	const data = {
		customerName,
		missingCpf: false,
		balance: toBalance(extract),
		statement: toStatement(extract),
		expiration: toExpiration(extract)
	}

	await writeCachedScreenData(document, data)
	return data
}

export const filterStatement = (movements, filter) => {
	if (filter === STATEMENT_FILTER.PENDING) {
		return movements.filter(movement => movement.status === MOVEMENT_STATUS.PENDING)
	}
	if (filter === STATEMENT_FILTER.EXPIRING) {
		return movements.filter(movement => movement.status === MOVEMENT_STATUS.EXPIRING)
	}
	return movements
}

/**
 * Confirmed destinations.
 *
 * WALLET is OpenCashback's white-labeled wallet (auth is CPF/CNPJ + SMS, a
 * separate identity from the VTEX login — opening it in the browser is correct;
 * the app must never hold OpenCashback credentials itself).
 */
export const BONUS_LINKS = {
	WHATSAPP: 'https://wa.me/5521995714886',
	FAQ: 'https://montecarlojoias.zendesk.com/hc/pt-br',
	WALLET: 'https://carteira.opencashback.io/montecarlo/login',
	HOW_IT_WORKS: 'https://www.montecarlo.com.br/meu-bonus'
}

/**
 * FAQ — copy taken from the real /meu-bonus accordion.
 *
 * Items with `answer` expand inline. "Como usar o bônus Monte Carlo?" has no
 * confirmed copy on the site, so it links out to the wallet instead of inventing
 * policy text (these are customer-facing rules — they must not be paraphrased).
 */
export const getBonusFaq = () => [
	{
		id: 'how-to-use',
		question: 'Como usar o bônus Monte Carlo?',
		url: BONUS_LINKS.WALLET
	},
	{
		id: 'rules',
		question: 'Quais as regras do Bônus?',
		answer:
			'O bônus é pessoal e intransferível e não é cumulativo com outras promoções. Não é válido para relógios das marcas Armani Exchange, Bulova, Diesel, Emporio Armani, Fossil, Guess, Michael Kors, Seiko, Skagen, Citizen, DKNY, Orient, Technos, Victorinox e Wegner. Produtos Seiko não geram nem resgatam bônus.'
	},
	{
		id: 'limit',
		question: 'Qual limite máximo de resgate do bônus?',
		answer: 'O resgate é limitado a R$ 5.000,00 e a 50% do valor da compra.'
	},
	{
		id: 'how-to-receive',
		question: 'Como recebo meu bônus?',
		answer:
			'O bônus é liberado 7 dias após a compra em loja física ou após o faturamento do pedido no site. Você é avisado por e-mail e SMS.'
	}
]
