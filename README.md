# eitri-shopping-template-vtex-deco

Multi-app Eitri workspace for a VTEX e-commerce storefront. See `AGENTS.md` for the full architecture guide, module breakdown, and coding conventions.

## `src/sections`

Esta pasta tem um comportamento especial dentro de um Eitri App: **todo componente colocado aqui é exposto publicamente** e fica disponível para ser consumido externamente (por exemplo, por ferramentas de montagem de página / CMS que listam e renderizam as _sections_ do app). Neste workspace, essa pasta existe em `eitri-shopping-template-vtex-deco-shared/src/sections` — veja também "Deco CMS Sections" em `AGENTS.md`.

### Como funciona

- Tudo o que está em `src/sections` é tratado como uma _section_ acessível publicamente.
- **Somente arquivos `.js`, `.ts`, `.jsx` e `.tsx` são aceitos.** Outros tipos de arquivo são ignorados.
- Subpastas são suportadas (ex.: `sections/Banners/Hero.tsx`) e fazem parte do caminho da section.

### O arquivo `sections.json`

Durante o desenvolvimento (`eitri start` ou `eitri app start`), é gerado um arquivo `sections.json` que contém **a lista dos arquivos presentes nesta pasta**.

Ele pode ser acessado em:

```
https://api.eitri.tech/runes-foundry/user/{WORKSPACE_ID}/sections/sections.json
```

Substitua `{WORKSPACE_ID}` pelo workspace id do seu app (veja abaixo como descobrir).

#### Acessando uma section específica

Cada arquivo da pasta também é acessível pela **mesma URL**, trocando `sections.json` pelo nome do arquivo. Por exemplo, a section do `Post.tsx` (criado na raiz de `src/sections`) fica em:

```
https://api.eitri.tech/runes-foundry/user/{WORKSPACE_ID}/sections/Post.tsx
```

Ou seja, o caminho após `/sections/` corresponde ao caminho do arquivo dentro da pasta — incluindo subpastas (ex.: `sections/Banners/Hero.tsx`).

> **Importante:** o workspace é **limpo diariamente**, então essa URL de desenvolvimento é temporária. Se precisar de uma **URL definitiva**, basta entrar em contato com o time da plataforma que disponibilizamos uma.

### Descobrindo o `WORKSPACE_ID`

Entre na pasta do Eitri App e rode:

```bash
eitri workspace current
```

A saída exibirá o **workspace id** do app, que deve ser usado na URL acima.

### Escrevendo uma section

Cada arquivo deve exportar como `default` um componente. Para que os campos da section sejam configuráveis externamente, declare uma interface `Props` e documente cada campo com anotações JSDoc:

- `@title` — rótulo amigável exibido para o campo.
- `@format` — formato/editor do campo (ex.: `textarea`, `datetime`).

#### Exemplo (`Post.tsx`)

```tsx
import { Text, View, Image } from 'eitri-luminus'

export interface Props {
	/**
	 * @title Post image.
	 */
	photo?: string
	/**
	 * @title Post body.
	 * @format textarea
	 */
	post: string
	/**
	 * @title Publish date.
	 * @format datetime
	 */
	datetime: string
	/**
	 * @title Post title.
	 */
	title: string
}

export default function Post({ title, photo, datetime, post }: Props) {
	return (
		<View>
			{photo && (
				<Image
					src={photo}
					alt={`${title} image`}
					height={300}
					width={300}
					className='rounded'
				/>
			)}
			<Text className='font-bold text-lg text-primary'>{title}</Text>
			<Text>Published at: {datetime}</Text>
			<Text>{post}</Text>
		</View>
	)
}
```

## Testes E2E

Rodam com Maestro contra o app Eitri Play — ver a seção "E2E Validation with Maestro" em `AGENTS.md` e `docs/maestro.md` para o guia completo (setup, comandos, gotchas).
