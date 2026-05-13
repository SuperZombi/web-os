const PERMISSION_SCOPES = {
    apps: {
        read: "apps:read",
        run: "apps:run"
    },
    settings: {
        read: "settings:read",
        write: "settings:write"
    }
}

window.SettingsManager = {
    settings: {
        language: (navigator.language?.slice(0, 2) || "en"),
        theme: "dark"
    },
    listeners: [],
    subscribe(listener) {
        this.listeners.push(listener)
        listener({ ...this.settings })
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener)
        }
    },
    get() {
        return { ...this.settings }
    },
    update(partial) {
        this.settings = { ...this.settings, ...partial }
        const next = { ...this.settings }
        this.listeners.forEach(listener => listener(next))
    }
}

window.AppManager = {
    registeredApps: {},
    registerApp: function(app, code) {
        this.registeredApps[app.id] = { ...app, code: code };
    },
    launchApp: function(appId) {
        const app = this.registeredApps[appId];
        if (app) {
            window.WindowManager.createWindow(app)
        } else {
            console.error(`App with id ${appId} not found!`)
        }
    }
}

window.loadApplication = async function(manifestUrl) {
	const manifest = await fetch(manifestUrl).then(r => r.json())
	const source = await fetch(manifest.entry).then(r => r.text())
	const wrappedSource = `const __AppComponent = (${source});`
	const compiled = Babel.transform(wrappedSource, {
		presets: ["react"]
	}).code
	const component = new Function("React", "window", `${compiled}; return __AppComponent;`)(React, undefined)
	window.AppManager.registerApp(manifest, component)
}

const hasPermission = (app, permission) => (app.permissions || []).includes(permission)

window.createAppApi = function(appId) {
    const app = window.AppManager.registeredApps[appId]
    const assertPermission = (permission) => {
        if (!hasPermission(app, permission)) {
            throw new Error(`Permission denied for ${appId}: ${permission}`)
        }
    }

    return Object.freeze({
        permissions: Object.freeze({ ...PERMISSION_SCOPES }),
        apps: Object.freeze({
            list: () => {
                assertPermission(PERMISSION_SCOPES.apps.read)
                return Object.values(window.AppManager.registeredApps).map(({ code, ...meta }) => ({ ...meta }))
            },
            run: (targetAppId) => {
                console.log(targetAppId)
                assertPermission(PERMISSION_SCOPES.apps.run)
                window.AppManager.launchApp(targetAppId)
            }
        }),
        settings: Object.freeze({
            get: () => {
                assertPermission(PERMISSION_SCOPES.settings.read)
                return window.SettingsManager.get()
            },
            update: (next) => {
                assertPermission(PERMISSION_SCOPES.settings.write)
                window.SettingsManager.update(next)
            },
            subscribe: (listener) => {
                assertPermission(PERMISSION_SCOPES.settings.read)
                return window.SettingsManager.subscribe(listener)
            }
        }),
        closeSelf: () => window.WindowManager.closeWindow(appId)
    })
}

window.WindowManager = {
	windows: [],
	listeners: [],
	subscribe(callback) {
		this.listeners.push(callback)
	},
	emit() {
		const cloned = [...this.windows]
		for (const listener of this.listeners) {
			listener(cloned)
		}
	},
	createWindow(config) {
		if (this.windows.some(w => w.id === config.id)){
			console.warn(`Window with id ${config.id} already exists!`)
			return
		}
		const api = window.createAppApi(config.id)
		this.windows.push({...config, component: React.createElement(config.code, { api })})
		this.emit()
	},
	closeWindow(id) {
		this.windows = this.windows.filter(w => w.id !== id)
		this.emit()
	}
}
