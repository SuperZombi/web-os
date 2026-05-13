({ api }) => {
    const [apps, setApps] = React.useState([])

    React.useEffect(() => {
        setApps(api.apps.list())
    }, [api])

    return (
        <div className="p-3">
            <h3 className="font-bold text-lg mb-2">Applications</h3>
            <div className="space-y-2">
                {apps.map(app => (
                    <button
                        key={app.id}
                        className="w-full text-left px-3 py-2 rounded bg-white/20 hover:bg-white/30 transition"
                        onClick={() => {
                            api.launchApp(app.id)
                            api.closeSelf()
                        }}
                    >
                        {app.name || app.id}
                    </button>
                ))}
            </div>
        </div>
    )
}
