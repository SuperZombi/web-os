({ api }) => {
    const [settings, setSettings] = React.useState(api.settings.get())

    React.useEffect(() => {
        return api.settings.subscribe(setSettings)
    }, [api])

    const toggleTheme = () => {
        api.settings.update({ theme: settings.theme === 'dark' ? 'light' : 'dark' })
    }

    const settingsRow = ({label, children}) => (
        <div className="flex items-center justify-between bg-white/10 rounded p-3">
            <span>{label}</span>
            {children}
        </div>
    )

    return (
        <div className="p-3 space-y-3">
            {settingsRow({label: "Theme", children: (
                <button
                    className="px-3 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white transition"
                    onClick={toggleTheme}
                >
                    {settings.theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
                </button>
            )})}
        </div>
    )
}
