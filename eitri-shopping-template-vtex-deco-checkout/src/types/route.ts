export interface RouteProps<TState = Record<string, any>> {
	match?: { params?: Record<string, string> }
	location?: { state?: TState; pathname?: string }
	history?: { location?: { state?: TState }; push?: (path: string, state?: TState) => void }
}
