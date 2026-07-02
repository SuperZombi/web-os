(() => {
    return ({ api }) => {
        const [apps, setApps] = React.useState([])
        const [theme, setTheme] = React.useState(api.settings.get().theme)

        React.useEffect(() => api.settings.subscribe(settings=>{
            setTheme(settings.theme)
        }), [api])

        React.useEffect(() => {
            setApps(api.apps.list())
        }, [api])

        return (
            <div className="p-3">
                <h3 className="font-bold text-lg mb-3 text-center">Applications</h3>
                <div className="grid grid-cols-4 gap-2">
                    {apps.filter(app => !app.hidden)
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map(app => (
                        <div key={app.id} className={`
                            flex flex-col items-center p-2 gap-1 rounded-lg cursor-pointer transition select-none overflow-hidden
                            ${theme === 'dark' ? 'bg-gray-500/25 hover:bg-gray-400/25' : 'bg-white/25 hover:bg-white/40'}
                        `} onClick={_=>{api.apps.run(app.id); api.closeSelf()}}>
                            <img src={app.icon} className="w-8 h-8" draggable={false} />
                            <span className="text-nowrap w-full text-center overflow-hidden">{app.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        )
    }
})()
