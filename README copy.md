# `src/sections`

Esta pasta tem um comportamento especial dentro de um Eitri App: **todo componente colocado aqui é exposto publicamente** e fica disponível para ser consumido externamente (por exemplo, por ferramentas de montagem de página / CMS que listam e renderizam as _sections_ do app).

## Como funciona

- Tudo o que está em `src/sections` é tratado como uma _section_ acessível publicamente.
- **Somente arquivos `.js`, `.ts`, `.jsx` e `.tsx` são aceitos.** Outros tipos de arquivo são ignorados.
- Subpastas são suportadas (ex.: `sections/Banners/Hero.tsx`) e fazem parte do caminho da section.

## O arquivo `sections.json`

Durante o desenvolvimento (`eitri start` ou `eitri app start`), é gerado um arquivo `sections.json` que contém **a lista dos arquivos presentes nesta pasta**.

Ele pode ser acessado em:

```
https://api.eitri.tech/runes-foundry/user/{WORKSPACE_ID}/sections/sections.json
```

Substitua `{WORKSPACE_ID}` pelo workspace id do seu app (veja abaixo como descobrir).

### Acessando uma section específica

Cada arquivo da pasta também é acessível pela **mesma URL**, trocando `sections.json` pelo nome do arquivo. Por exemplo, a section do `Post.tsx` (criado na raiz de `src/sections`) fica em:

```
https://api.eitri.tech/runes-foundry/user/{WORKSPACE_ID}/sections/Post.tsx
```

Ou seja, o caminho após `/sections/` corresponde ao caminho do arquivo dentro da pasta — incluindo subpastas (ex.: `sections/Banners/Hero.tsx`).

> **Importante:** o workspace é **limpo diariamente**, então essa URL de desenvolvimento é temporária. Se precisar de uma **URL definitiva**, basta entrar em contato com o time da plataforma que disponibilizamos uma.

## Descobrindo o `WORKSPACE_ID`

Entre na pasta do Eitri App e rode:

```bash
eitri workspace current
```

A saída exibirá o **workspace id** do app, que deve ser usado na URL acima.

## Escrevendo uma section

Cada arquivo deve exportar como `default` um componente. Para que os campos da section sejam configuráveis externamente, declare uma interface `Props` e documente cada campo com anotações JSDoc:

- `@title` — rótulo amigável exibido para o campo.
- `@format` — formato/editor do campo (ex.: `textarea`, `datetime`).

### Exemplo (`Post.tsx`)

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

## Testes E2E com Maestro

Os testes de UI end-to-end rodam com [Maestro](https://docs.maestro.dev) contra o app **Eitri Play** (`tech.eitri.play`), via `adb`, em um device Android real (ou emulador, como fallback).

## Pré-requisitos

- Maestro CLI e `adb` instalados (Java 17+).
- Device Android com o app **Eitri Play** instalado:
  - Dev: rode `eitri app start` na raiz e pareie o Eitri Play (QR code).
  - Ou use a versão publicada dos apps.

## Conectando o device

```sh
adb connect <ip-do-device>:<porta>   # só se for via Wi-Fi
adb devices                          # deve listar o device como "device"
```

## Rodando os flows

```sh
# um flow específico
maestro test .maestro/flows/smoke-home.yml

# todos os flows do workspace
maestro test .maestro/

# só o suite de smoke
maestro test .maestro/ --include-tags smoke

# com mais de um device conectado
maestro --device <serial> test .maestro/flows/smoke-home.yml
```

## Gotchas

- O conteúdo do app é WebView: seletores são por **texto visível**. Use `maestro studio` para inspecionar a tela antes de escrever asserts.
- O Eitri Play pode abrir no **launcher de dev** em vez do app da loja — o `smoke-home.yml` trata isso com um `runFlow` condicional (requer `eitri app start` rodando no host).
- Apps abertos via launcher de dev rodam **sem a bottom bar nativa** — não assertar em títulos de tab, e sim em conteúdo da própria tela.

Detalhes completos, incluindo como escrever novos flows, em [docs/maestro.md](docs/maestro.md).
