({ api }) => {
    const [settings, setSettings] = React.useState(api.settings.get())

    React.useEffect(() => {
        return api.settings.subscribe(setSettings)
    }, [api])

    const updateSetting = (next) => api.settings.update(next)

    const section = ({ title, subtitle, children }) => (
        <div className="rounded-xl border border-white/15 bg-black/25 p-4 space-y-3 shadow-lg">
            <div>
                <h3 className="text-sm uppercase tracking-wide opacity-70">{title}</h3>
                {subtitle && <p className="text-xs opacity-60 mt-1">{subtitle}</p>}
            </div>
            {children}
        </div>
    )

    const row = ({ label, hint, children }) => (
        <div className="flex items-center justify-between gap-4 rounded-lg bg-white/10 px-3 py-2">
            <div>
                <div className="font-medium">{label}</div>
                {hint && <div className="text-xs opacity-65">{hint}</div>}
            </div>
            {children}
        </div>
    )

    const accentOptions = ["#3b82f6", "#8b5cf6", "#14b8a6", "#f59e0b", "#ef4444", "#22c55e"]

    return (
        <div className="h-full overflow-auto p-4 text-white bg-gradient-to-b from-black/20 to-black/40 space-y-4">
            {section({
                title: "Appearance",
                children: (
                    <div className="space-y-3">
                        {row({
                            label: "Theme",
                            hint: settings.theme === 'dark' ? 'Dark mode is active' : 'Light mode is active',
                            children: (
                                <button
                                    className="px-3 py-1.5 rounded-md text-white transition"
                                    style={{ backgroundColor: settings.accentColor || '#3b82f6' }}
                                    onClick={() => updateSetting({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
                                >
                                    {settings.theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
                                </button>
                            )
                        })}

                        <div>
                            <div className="text-sm mb-2">Accent color</div>
                            <div className="flex flex-wrap gap-2">
                                {accentOptions.map(color => (
                                    <button
                                        key={color}
                                        className={`h-8 w-8 rounded-full border-2 transition ${settings.accentColor === color ? 'border-white scale-110' : 'border-white/30'}`}
                                        style={{ backgroundColor: color }}
                                        onClick={() => updateSetting({ accentColor: color })}
                                        title={color}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )
            })}

            {section({
                title: "Clock",
                children: (
                    <div className="space-y-3">
                        {row({
                            label: "Show seconds",
                            hint: "Display HH:MM:SS instead of HH:MM",
                            children: (
                                <input type="checkbox" checked={!!settings.clockShowSeconds} onChange={e => updateSetting({ clockShowSeconds: e.target.checked })} />
                            )
                        })}
                        {row({
                            label: "Show date",
                            hint: "Display the current date under the time",
                            children: (
                                <input type="checkbox" checked={!!settings.clockShowDate} onChange={e => updateSetting({ clockShowDate: e.target.checked })} />
                            )
                        })}
                    </div>
                )
            })}
        </div>
    )
}
