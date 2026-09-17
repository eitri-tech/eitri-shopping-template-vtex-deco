// react-icons is used across the bundle (Header icons, PDP, cart, checkout, account) but is not
// declared in any app's `eitri-app-dependencies` in eitri-app.conf.js — only the specialist
// skill's supported-dependency table (react-icons 5.5.0) sanctions it. Flag this to the user:
// the bundle likely resolves it today only via hoisting from another package's node_modules: it
// should be declared explicitly per eitri-app.conf.js to avoid a broken build. This shim only
// covers the icons actually imported in this codebase — extend it if a new icon is added.
// No top-level import here on purpose: if it fails to resolve, TS silently drops every
// `declare module` block below along with it, which is exactly what broke this shim the first
// time around. `JSX.Element` is a global type, so this stays self-contained.
type IconType = (props: {
	size?: string | number
	color?: string
	title?: string
	className?: string
	style?: Record<string, unknown>
	onClick?: () => void
	[key: string]: unknown
}) => JSX.Element

declare module 'react-icons/fa' {
	export const FaChevronRight: IconType
	export const FaHeart: IconType
	export const FaStar: IconType
}

declare module 'react-icons/fi' {
	export const FiCheck: IconType
	export const FiX: IconType
	export const FiChevronDown: IconType
	export const FiChevronLeft: IconType
	export const FiChevronRight: IconType
	export const FiClock: IconType
	export const FiCopy: IconType
	export const FiCreditCard: IconType
	export const FiTrash2: IconType
	export const FiEdit2: IconType
	export const FiMinus: IconType
	export const FiPlus: IconType
	export const FiPackage: IconType
	export const FiHeart: IconType
	export const FiMapPin: IconType
	export const FiFileText: IconType
	export const FiShoppingBag: IconType
	export const FiTruck: IconType
	export const FiSearch: IconType
	export const FiShare2: IconType
	export const FiUser: IconType
	export const FiLock: IconType
	export const FiRepeat: IconType
	export const FiXCircle: IconType
}

declare module 'react-icons/io5' {
	export const IoBagAddOutline: IconType
	export const IoBagOutline: IconType
	export const IoCloseSharp: IconType
}

declare module 'react-icons/lu' {
	export const LuChevronRight: IconType
}

declare module 'react-icons/md' {
	export const MdFavoriteBorder: IconType
	export const MdFavorite: IconType
	export const MdOutlineQrCodeScanner: IconType
}
