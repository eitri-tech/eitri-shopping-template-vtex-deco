// `@tanstack/react-query` is imported by home/src/views/Home.tsx (useQuery for the CMS home
// content fetch) but, unlike react-icons, it is not present ANYWHERE under any app's resolved
// node_modules cache (~/.eitri/<application-id>/node_modules) — not just untyped, actually
// unresolved. It is not declared in any eitri-app.conf.js `eitri-app-dependencies` block either.
// This is a real, open finding: at runtime `import { useQuery } from '@tanstack/react-query'`
// is very likely to throw a module-not-found error and blank the Home screen. Flag this to the
// user — the dependency needs to be added to home's eitri-app.conf.js (or the call site rewritten
// to use plain useState/useEffect, matching the rest of this codebase's data-fetching style,
// since react-query isn't used anywhere else in the bundle).
// This shim only exists to let tsc check the rest of Home.tsx; it does not make the import
// resolve at runtime.
// No top-level import here on purpose — see react-icons.d.ts in this same directory for why.
declare module '@tanstack/react-query' {
	interface UseQueryOptions<TData> {
		queryKey: unknown[]
		queryFn: () => Promise<TData>
		enabled?: boolean
		[key: string]: unknown
	}

	interface UseQueryResult<TData> {
		data: TData | undefined
		isLoading: boolean
		error: unknown
		[key: string]: unknown
	}

	export function useQuery<TData = unknown>(options: UseQueryOptions<TData>): UseQueryResult<TData>
}
