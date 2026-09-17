/**
 * Widgets compartilhados pelas seções do CMS Deco.
 *
 * São `string` em runtime, mas o `@format` faz o admin do Deco renderizar um
 * editor específico em vez de um input de texto simples. `ImageWidget`, por
 * exemplo, exibe o seletor de mídia com upload (em vez de pedir a URL colada).
 *
 * Uso: `import type { ImageWidget } from '../types/widgets'` e declare o campo
 * como `imageUrl?: ImageWidget`.
 */

/** @format image-uri */
export type ImageWidget = string

/** @format video-uri */
export type VideoWidget = string

/** @format html */
export type HTMLWidget = string

/** @format rich-text */
export type RichText = string

/** @format color */
export type Color = string
