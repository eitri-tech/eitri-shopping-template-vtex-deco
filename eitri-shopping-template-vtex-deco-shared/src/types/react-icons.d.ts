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
	export const FaRegTrashAlt: IconType
	export const FaWhatsapp: IconType
	export const FaHandHoldingUsd: IconType
}

declare module 'react-icons/pi' {
	export const PiHeartStraightLight: IconType
	export const PiHeartStraightFill: IconType
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
	export const FiArrowDown: IconType
	export const FiArrowUp: IconType
	export const FiArrowLeft: IconType
	export const FiBell: IconType
	export const FiHeadphones: IconType
	export const FiHelpCircle: IconType
	export const FiInfo: IconType
	export const FiLogOut: IconType
	export const FiMail: IconType
	export const FiMessageCircle: IconType
	export const FiRotateCcw: IconType
	export const FiSliders: IconType
	export const FiStar: IconType
}

declare module 'react-icons/io5' {
	export const IoBagAddOutline: IconType
	export const IoBagOutline: IconType
	export const IoCloseSharp: IconType
}

declare module 'react-icons/lu' {
	export const LuChevronRight: IconType
	export const LuArrowUpDown: IconType
	export const LuBadgePercent: IconType
	export const LuCircleDollarSign: IconType
	export const LuPercent: IconType
	export const LuShoppingCart: IconType
	export const LuTag: IconType
	export const LuTicket: IconType
}

declare module 'react-icons/hi2' {
	export const HiOutlineClipboardDocument: IconType
	export const HiOutlineClipboardDocumentCheck: IconType
}

declare module 'react-icons/ri' {
	export const RiShoppingBagLine: IconType
}

declare module 'react-icons/md' {
	export const MdFavoriteBorder: IconType
	export const MdFavorite: IconType
	export const MdOutlineQrCodeScanner: IconType
}

declare module 'react-icons/go' {
	export const GoAlert: IconType
	export const GoGift: IconType
}

declare module 'react-icons/tfi' {
	export const TfiArrowRight: IconType
}
