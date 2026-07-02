(() => {
    const LeftMenuItem = ({ icon, text, active, accentColor, onClick }) => {
        return (
            <div className="grid grid-cols-[16px_1fr] items-center gap-2 px-3 py-2 cursor-pointer transition rounded-lg
                hover:bg-white/10 text-sm select-none
            "
                style={{
                    backgroundColor: active ? accentColor : ""
                }}
                onClick={onClick}
            >
                <i className={`fa-solid ${icon} text-center`}></i>
                <span>{text}</span>
            </div>
        )
    }
    const LeftMenu = ({ activeTab, setActiveTab, accentColor }) => {
        return (
            <div className="p-2 flex flex-col gap-1 border-r border-gray-400/25">
                <LeftMenuItem icon="fa-solid fa-house" text="Installed"
                    active={activeTab === "installed"} accentColor={accentColor}
                    onClick={_ => setActiveTab("installed")}
                />
                <LeftMenuItem icon="fa-solid fa-magnifying-glass" text="All apps"
                    active={activeTab === "all"} accentColor={accentColor}
                    onClick={_ => setActiveTab("all")}
                />
            </div>
        )
    }
    const AppsList = ({ apps, installedApps, accentColor, theme, deleteApp, installApp }) => {
        const filtered = apps.filter(app => !app.hidden && !app.system)
        if (filtered.length == 0){
            return (
                <div className="flex flex-col items-center justify-center gap-1">
                    <span className="font-mono select-none">¯\_(ツ)_/¯</span>
                    <span className="text-lg font-semibold">No apps</span>
                </div>
            )
        }
        return (
            <div className="p-2 flex flex-col gap-2 overflow-y-auto"
                style={{scrollbarColor: `${accentColor} ${theme === "dark" ? "#090f1a" : "#757a75"}`}}
            >
                {filtered.sort((a, b) => a.name.localeCompare(b.name))
                .map(app => (
                    <AppCard key={app.id} accentColor={accentColor}
                        app={{...app, installed: installedApps.includes(app.id)}}
                        installApp={installApp} deleteApp={deleteApp}
                    />
                ))}
            </div>
        )
    }
    const ActionButton = ({variant, children, accentColor, onClick}) => {
        return (
            <button className={`ml-auto px-3 py-1 text-white text-sm rounded transition active:scale-[0.96]
                ${variant == "delete" ? "bg-red-500 hover:bg-red-600" : `bg-[${accentColor}] hover:bg-[${accentColor}]/80`}
            `}
                onClick={onClick}
            >
                {children}
            </button>
        )
    }
    const AppCard = ({ app, deleteApp, installApp, accentColor }) => {
        const [loading, setLoading] = React.useState(false)
        const onInstall = async url=>{
            setLoading(true)
            await installApp(url)
            setLoading(false)
        }
        return (
            <div className="p-3 bg-white/10 rounded-lg hover:shadow-md transition flex gap-2 items-center">
                <img className="w-9 h-9 object-contain select-none" src={app.icon} draggable={false} />
                <span className="text-sm font-medium text-nowrap select-none">{app.name}</span>
                {
                    loading ? (
                        <ActionButton accentColor={accentColor}>
                            <i className="fa-solid fa-circle-notch fa-spin"></i>
                        </ActionButton>
                    ) : (
                        app.installed ? (
                            <ActionButton variant="delete" onClick={_ => {deleteApp(app.id)}}>
                                <i className="fa-solid fa-trash"></i>
                            </ActionButton>
                        ) : (
                            <ActionButton accentColor={accentColor} onClick={_=>onInstall(app.url)}>
                                <i className="fa-solid fa-arrow-down"></i>
                            </ActionButton>
                        )
                    )
                }
            </div>
        )
    }

    return ({ api }) => {
        const [apps, setApps] = React.useState([])
        const [installedApps, setInstalledApps] = React.useState([])
        const [activeTab, setActiveTab] = React.useState("installed")
        const [theme, setTheme] = React.useState(api.settings.get().theme)
        const [accentColor, setAccentColor] = React.useState(api.settings.get().accentColor)

        React.useEffect(() => {
            setInstalledApps(api.apps.list())
        }, [api])

        React.useEffect(_=>{
            setApps([{
                id: "calculator",
                name: "Calculator",
                icon: new URL('apps/calculator/icon.png', location.href).href,
                url: new URL('apps/calculator/manifest.json', location.href).href
            }])
        }, [])

        const deleteApp = (appId) => {
            if (api.apps.delete(appId)) {
                setInstalledApps(api.apps.list())
            }
        }
        const installApp = async (app) => {
            await api.apps.install(app)
            setInstalledApps(api.apps.list())
        }

        React.useEffect(() => api.settings.subscribe(settings=>{
            setAccentColor(settings.accentColor)
            setTheme(settings.theme)
        }), [api])
        
        return (
            <div className="grid grid-cols-[1fr_2fr] h-full overflow-hidden">
                <LeftMenu activeTab={activeTab} setActiveTab={setActiveTab} accentColor={accentColor}></LeftMenu>
                <AppsList
                    apps={activeTab == "installed" ? installedApps : apps}
                    installedApps={installedApps.map(a=>a.id)}
                    accentColor={accentColor}
                    theme={api.settings.get().theme}
                    deleteApp={deleteApp}
                    installApp={installApp}
                ></AppsList>
            </div>
        )
    }
})()
