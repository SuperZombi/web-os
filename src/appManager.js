const PERMISSION_SCOPES = {
    apps: {
        read: "apps:read",
        run: "apps:run",
        delete: "apps:delete",
        install: "apps:install"
    },
    settings: {
        read: "settings:read",
        write: "settings:write"
    },
    storage: "storage",
}

window.SettingsManager = {
    storageKey: "webos:settings",
    wallpapers: {
        dark: "src/images/dark.jpeg",
        light: "src/images/light.jpg",    
    },
    settings: (() => {
        const defaults = {
            language: (navigator.language?.slice(0, 2) || "en"),
            theme: "dark",
            accentColor: "#3b82f6",
            clockShowSeconds: false,
            clockShowDate: false,
            calendarWeekStartsOn: 1,
            soundsStyle: "11",
            wallpaper: "dark",
            apps: [],
        }
        try {
            const raw = localStorage.getItem("webos:settings")
            if (!raw) return defaults
            const saved = JSON.parse(raw)
            return { ...defaults, ...saved }
        } catch (_) {
            return defaults
        }
    })(),
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
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(next))
        } catch (_) {}
        this.listeners.forEach(listener => listener(next))
    }
}

window.SoundManager = {
    sounds: {
        welcome: {
            "95": "src/audio/windows-95-startup.mp3",
            "xp": "src/audio/windows-xp-startup.mp3",
            "longhorn": "src/audio/windows-longhorn-startup.mp3",
            "7": "src/audio/windows-7-startup.mp3",
            "11": "src/audio/windows-11-startup.mp3",
        }
    },
    playWelcomeSound: (resolve, reject) => {
        const soundsStyle = window.SettingsManager.get().soundsStyle
        const soundFile = window.SoundManager.sounds.welcome[soundsStyle]
        if (!soundFile) return
        const audio = new Audio(soundFile)
        audio.play().then(resolve).catch(reject)
    }
}

window.AppManager = {
    registeredApps: {},
    registerApp: function(app, code) {
        this.registeredApps[app.id] = { ...app, code: code };
    },
    deleteApp: function(appId) {
        if (this.registeredApps[appId]) {
            window.WindowManager.closeWindow(appId)
            const target_app = this.registeredApps[appId]
            if (target_app){
                window.SettingsManager.update({
                    apps: [...new Set([...(window.SettingsManager.get().apps ?? []).filter(x=>x!==target_app.url)])]
                })
                delete this.registeredApps[appId];
                return true;
            }
        }
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

window.loadApplication = async function(manifestUrl, system=false) {
	const manifest = await fetch(manifestUrl).then(r => r.json())
    const entryUrl = new URL(manifest.entry, manifestUrl).href
	const source = await fetch(entryUrl).then(r => r.text())
	const wrappedSource = `const __AppComponent = (${source});`
	const compiled = Babel.transform(wrappedSource, {
		presets: ["react"]
	}).code
	const component = new Function("React", "window", `${compiled}; return __AppComponent;`)(React, undefined)
	window.AppManager.registerApp({
        ...manifest, icon: new URL(manifest.icon, manifestUrl).href,
        system: system,
        url: manifestUrl
    }, component)
}
window.installApplication = async function(url) {
    await window.loadApplication(url)
    window.SettingsManager.update({
        apps: [...new Set([...(window.SettingsManager.get().apps ?? []), url])]
    })
}

const hasPermission = (app, permission) => (app.permissions || []).includes(permission)

window.createAppApi = function(appId) {
    const app = window.AppManager.registeredApps[appId]
    const assertPermission = (permission) => {
        if (hasPermission(app, permission)) {
            return true
        }
        console.error(`Permission denied for ${appId}: ${permission}`)
    }

    return Object.freeze({
        apps: Object.freeze({
            list: () => {
                if (assertPermission(PERMISSION_SCOPES.apps.read)) {
                    return Object.values(window.AppManager.registeredApps).map(({ code, ...meta }) => ({ ...meta }))
                }
            },
            run: (targetAppId) => {
                if (assertPermission(PERMISSION_SCOPES.apps.run)) {
                    window.AppManager.launchApp(targetAppId)
                }
            },
            delete: (targetAppId) => {
                if (assertPermission(PERMISSION_SCOPES.apps.delete)) {
                    return window.AppManager.deleteApp(targetAppId)
                }
            },
            install: (manifest_url) => {
                if (assertPermission(PERMISSION_SCOPES.apps.install)) {
                    return window.installApplication(manifest_url)
                }
            }
        }),
        settings: Object.freeze({
            get: () => {
                if (assertPermission(PERMISSION_SCOPES.settings.read)) {
                    return window.SettingsManager.get()
                }
            },
            update: (next) => {
                if (assertPermission(PERMISSION_SCOPES.settings.write)) {
                    window.SettingsManager.update(next)
                }
            },
            subscribe: (listener) => {
                if (assertPermission(PERMISSION_SCOPES.settings.read)) {
                    return window.SettingsManager.subscribe(listener)
                }
            }
        }),
        storage: Object.freeze({
            get: (item) => {
                if (assertPermission(PERMISSION_SCOPES.storage)) {
                    const keyPrefix = `webos:${appId}`
                    const data = localStorage.getItem(keyPrefix)
                    const parsedData = data ? JSON.parse(data) : {}
                    return parsedData[item]
                }
            },
            getAll: () => {
                if (assertPermission(PERMISSION_SCOPES.storage)) {
                    const keyPrefix = `webos:${appId}`
                    const data = localStorage.getItem(keyPrefix)
                    return data ? JSON.parse(data) : {}
                }
            },
            set: (data) => {
                if (assertPermission(PERMISSION_SCOPES.storage)) {
                    const keyPrefix = `webos:${appId}`
                    const oldData = localStorage.getItem(keyPrefix)
                    const mergedData = { ...JSON.parse(oldData || "{}"), ...data }
                    localStorage.setItem(keyPrefix, JSON.stringify(mergedData))
                }
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
		callback([...this.windows])
		return () => {
			this.listeners = this.listeners.filter(l => l !== callback)
		}
	},
	emit() {
		const cloned = [...this.windows]
		for (const listener of this.listeners) {
			listener(cloned)
		}
	},
    getActiveWindow() {
        return this.windows[this.windows.length - 1]
    },
	focusWindow(id) {
		const idx = this.windows.findIndex(w => w.id === id)
		if (idx === -1 || idx === this.windows.length - 1) return
		const [win] = this.windows.splice(idx, 1)
		this.windows.push(win)
		this.emit()
	},
	minimizeWindow(id) {
		const win = this.windows.find(w => w.id === id)
		if (!win) return
		win.minimized = true
		this.emit()
	},
	restoreWindow(id) {
		const idx = this.windows.findIndex(w => w.id === id)
		if (idx === -1) return
		this.windows[idx].minimized = false
		this.emit()
		this.focusWindow(id)
	},
	toggleMinimizeWindow(id) {
		const win = this.windows.find(w => w.id === id)
		if (!win) return
		if (win.minimized) {
			this.restoreWindow(id)
			return
		}
		this.minimizeWindow(id)
	},
	createWindow(config) {
        const exsisting = this.windows.find(w => w.id === config.id)
		if (exsisting) {
			if (exsisting.minimized) {
				this.restoreWindow(config.id)
				return
			}
			this.focusWindow(config.id)
			return
		}
		const api = window.createAppApi(config.id)
		this.windows.push({...config, minimized: false, component: React.createElement(config.code, { api })})
		this.emit()
		this.focusWindow(config.id)
	},
	closeWindow(id) {
		this.windows = this.windows.filter(w => w.id !== id)
		this.emit()
	}
}
