const { execSync, spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

const MANAGER_URL = 'https://api.eitri.tech/eitri-manager-api/v2/revisions?eitriAppId='
const BLIND_GUARDIAN_URL = 'https://api.eitri.tech/blind-guardian-api/v2/o/auth'
const DEV_ENV_ID = ''
const PROD_ENV_ID = ''

const credentials = {
	client_id: process.env.EITRI_CLI_CLIENT_ID,
	client_secret: process.env.EITRI_CLI_CLIENT_SECRET,
	grant_type: 'client_credentials'
}

async function authenticate() {
	try {
		const response = await fetch(BLIND_GUARDIAN_URL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(credentials)
		})

		if (!response.ok) {
			const error = await response.json()
			throw new Error(error.message || 'Erro na autenticação')
		}

		const data = await response.json()
		return data.accessToken
	} catch (error) {
		console.error('Erro ao autenticar:', error.message)
		throw new Error('Falha na autenticação')
	}
}

function listProjects(directoryPath) {
	return fs
		.readdirSync(directoryPath, { withFileTypes: true })
		.filter(dirent => dirent.isDirectory())
		.map(dirent => dirent.name)
		.filter(folder => fs.existsSync(path.join(directoryPath, folder, 'eitri-app.conf.js')))
}

async function getPublishedVersions(eitriAppId, token) {
	try {
		const response = await fetch(`${MANAGER_URL}${eitriAppId}`, {
			method: 'GET',
			headers: { Authorization: `Bearer ${token}` }
		})

		if (!response.ok) {
			const error = await response.json()
			throw new Error(error.message || `Erro ao buscar versões para o ID ${eitriAppId}`)
		}

		const data = await response.json()

		// Provavelmente é a primeira versão a ser integrada
		if (!data.revisions || data.revisions.length == 0) {
			return '0.0.0'
		}

		const latestRevision = data.revisions.reduce((latest, current) => {
			return new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest
		}, data.revisions[0])

		return latestRevision.version // Retorne apenas a versão
	} catch (error) {
		console.error(`Erro ao buscar versões para o ID ${eitriAppId}:`, error.message)
		throw new Error('Falha ao obter versões publicadas')
	}
}

function getProjectConfig(project, directoryPath) {
	const configPath = path.join(directoryPath, `./${project}/eitri-app.conf.js`)
	if (!fs.existsSync(configPath)) {
		throw new Error(`Arquivo de configuração não encontrado: ${configPath}`)
	}
	const { version, id, sharedVersion, messageVersion, versionMessage, sharedCompiler } = require(configPath)
	const isShared = sharedVersion || sharedCompiler
	return { version, id, sharedVersion: isShared, message: messageVersion || versionMessage }
}

function isVersionGreater(localVersion, publishedVersion) {
	const parseVersion = version => version.split('.').map(num => parseInt(num, 10))

	const localParts = parseVersion(localVersion)
	const publishedParts = parseVersion(publishedVersion)

	for (let i = 0; i < Math.max(localParts.length, publishedParts.length); i++) {
		const localPart = localParts[i] || 0
		const publishedPart = publishedParts[i] || 0

		if (localPart > publishedPart) return true
		if (localPart < publishedPart) return false
	}
	return false // As versões são iguais
}

function spawnAsync(command, options = {}) {
	const { label, ...spawnOpts } = options
	return new Promise((resolve, reject) => {
		const child = spawn('sh', ['-c', command], { ...spawnOpts, stdio: ['ignore', 'pipe', 'pipe'] })
		const prefix = label ? `[${label}] ` : ''
		child.stdout.on('data', data => {
			String(data).split('\n').filter(Boolean).forEach(line => console.log(prefix + line))
		})
		child.stderr.on('data', data => {
			String(data).split('\n').filter(Boolean).forEach(line => console.error(prefix + line))
		})
		child.on('close', code => {
			if (code !== 0) reject(new Error(`${prefix}Command exited with code ${code}`))
			else resolve()
		})
		child.on('error', reject)
	})
}

async function publishProject(project, directoryPath, sharedVersion = false, message = '') {
	const projectPath = path.resolve(directoryPath, `./${project}`)
	const safeMessage = String(message).replace(/'/g, "'\\''")

	await spawnAsync(`eitri push-version -m '${safeMessage}' ${sharedVersion ? '--shared' : ''}`, {
		cwd: projectPath,
		label: project
	})

	if (DEV_ENV_ID) {
		await spawnAsync(`eitri publish -e ${DEV_ENV_ID}`, {
			cwd: projectPath,
			label: project
		})
	}
	if (PROD_ENV_ID) {
		await spawnAsync(`eitri publish -e ${PROD_ENV_ID}`, {
			cwd: projectPath,
			label: project
		})
	}
}

async function checkAndPushInDirectory(directoryPath, token) {
	let hasError = false

	try {
		const projects = listProjects(directoryPath)
		// console.log('Projetos encontrados:', projects)

		const updatedProjects = []

		for (const project of projects) {
			try {
				// console.log(`Verificando versões para o projeto: ${project}`)
				const appConfig = getProjectConfig(project, directoryPath)
				const localVersion = appConfig.version
				const publishedVersions = await getPublishedVersions(appConfig.id, token)

				if (isVersionGreater(localVersion, publishedVersions)) {
					console.log(
						`${project}: Versão local (${localVersion}) é maior que a publicada ${publishedVersions}.`
					)

					updatedProjects.push({
						project,
						directoryPath,
						sharedVersion: appConfig.sharedVersion,
						message: appConfig.message || ''
					})
				} else {
					console.log(`${project} sem nova versão`)
				}
			} catch (error) {
				console.error(`${project} Erro ao processar o projeto:`, error.message)
			}
		}

		if (updatedProjects.length > 0) {
			// Shared must publish first — apps depend on it
			const sharedList = updatedProjects.filter(p => p.sharedVersion)
			const appList = updatedProjects.filter(p => !p.sharedVersion)

			for (const project of sharedList) {
				try {
					console.log(`${project.project} Publicando (shared)...`)
					await publishProject(project.project, project.directoryPath, project.sharedVersion, project.message)
					console.log(`${project.project} Publicado!`)
				} catch (error) {
					console.error(`${project.project} Erro ao publicar shared:`, error.message)
					hasError = true
					if (appList.length > 0) {
						console.error('Publicação do shared falhou. Apps não publicados:', appList.map(p => p.project).join(', '))
					}
				}
			}

			// Independent apps publish in parallel
			if (!hasError && appList.length > 0) {
				console.log(`Publicando ${appList.length} app(s) em paralelo...`)
				const results = await Promise.allSettled(
					appList.map(async project => {
						console.log(`${project.project} Publicando...`)
						await publishProject(project.project, project.directoryPath, project.sharedVersion, project.message)
						console.log(`${project.project} Publicado!`)
					})
				)

				for (let i = 0; i < results.length; i++) {
					if (results[i].status === 'rejected') {
						console.error(`${appList[i].project} Erro ao publicar:`, results[i].reason.message)
						hasError = true
					}
				}
			}
		} else {
			console.log('Nenhum projeto atualizado')
		}
	} catch (error) {
		console.error(error)
		hasError = true
	}

	if (hasError) {
		process.exit(1)
	}
}

async function checkAndPush() {
	console.log('Autenticando...')
	const token = await authenticate()
	console.log('Token obtido com sucesso!')

	await checkAndPushInDirectory(__dirname, token)
}

checkAndPush()
