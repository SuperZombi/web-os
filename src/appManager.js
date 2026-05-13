window.AppManager = {
    registeredApps: {},
    registerApp: function(app, code) {
        this.registeredApps[app.id] = { ...app, code: code };
    },
    launchApp: function(appId) {
        const app = this.registeredApps[appId];
        if (app) {
            window.WindowManager.createWindow(app)
            // new Function(app.code)(app)
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
	const component = new Function("React", `${compiled}; return __AppComponent;`)(React)
	// new Function(
	// 	"React",
	// 	"OS",
	// 	compiled
	// )(React, OS)
	window.AppManager.registerApp(manifest, component)
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
        // console.log(new Function(config.code))
		this.windows.push({...config, component: React.createElement(config.code)})
		this.emit()
	},
	closeWindow(id) {
		this.windows = this.windows.filter(w => w.id !== id)
		this.emit()
	}
}
