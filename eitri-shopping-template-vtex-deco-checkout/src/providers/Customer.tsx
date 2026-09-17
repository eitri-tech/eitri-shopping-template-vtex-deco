import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { getCustomerData } from '../services/CustomerService'
// `@/*` only resolves correctly per-app in Forge's real build config — the shared workspace-wide
// tsconfig used for type-checking this whole bundle can only point it at one app, so it always
// fails to resolve here. Relative import instead; same module, verifiable either way.
import { getUserByEmail } from '../services/cartService'

interface CheckoutProfile {
	userProfile?: { email?: string; [key: string]: unknown }
	[key: string]: unknown
}

interface CustomerContextValue {
	checkoutProfile?: CheckoutProfile | null
	setCheckoutProfile?: (profile: CheckoutProfile | null) => void
	getCustomer?: () => Promise<unknown>
	customer?: unknown
	getUserByEmail?: (email: string) => Promise<unknown>
}

const LocalCustomer = createContext<CustomerContextValue>({})

interface CustomerProviderProps {
	children?: ReactNode
}

export default function CustomerProvider(props: CustomerProviderProps) {
	const { children } = props
	const [customer, setCustomer] = useState<unknown>(null)
	const [checkoutProfile, setCheckoutProfile] = useState<CheckoutProfile | null>(null)

	const getCustomer = async () => {
		const customer = await getCustomerData()
		if (!customer) return
		setCustomer(customer)
		return customer
	}

	const _getUserByEmail = async (email: string) => {
		if (checkoutProfile && checkoutProfile?.userProfile?.email === email) return checkoutProfile
		const customer = (await getUserByEmail(email)) as CheckoutProfile
		setCheckoutProfile(customer)
		return customer
	}

	return (
		<LocalCustomer.Provider
			value={{
				checkoutProfile,
				setCheckoutProfile,
				getCustomer,
				customer,
				getUserByEmail: _getUserByEmail
			}}>
			{children}
		</LocalCustomer.Provider>
	)
}

export function useCustomer() {
	const context = useContext(LocalCustomer)

	return context
}
