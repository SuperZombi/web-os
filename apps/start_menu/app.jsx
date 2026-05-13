({ api }) => {
    const [apps, setApps] = React.useState([])
    const [theme, setTheme] = React.useState("light")

    React.useEffect(() => {
        setApps(api.apps.list())
        setTheme(api.settings.get().theme)
    }, [api])

    return (
        <div className="p-3">
            <h3 className="font-bold text-lg mb-2 text-center">Applications</h3>
            <div className="grid grid-cols-5 gap-2">
                {apps.map(app => (
                    !app.hidden && (
                        <div key={app.id} className={`
                            flex flex-col items-center p-2 gap-1 rounded-lg cursor-pointer transition select-none
                            ${theme === 'dark' ? 'bg-gray-500/25 hover:bg-gray-400/25' : 'bg-white/25 hover:bg-white/40'}
                        `} onClick={_=>{api.apps.run(app.id); api.closeSelf()}}>
                            <img src={app.icon} className="w-8 h-8" draggable={false} />
                            <span>{app.name}</span>
                        </div>
                    )
                ))}
            </div>
        </div>
    )
}
