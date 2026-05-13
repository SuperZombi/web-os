({ api }) => {
    const [settings, setSettings] = React.useState(api.settings.get())

    React.useEffect(() => api.settings.subscribe(setSettings), [api])

    const updateSetting = (next) => api.settings.update(next)

    const section = ({ title, subtitle, children }) => (
        <div className="rounded-2xl border border-white/15 bg-black/25 p-4 space-y-3 shadow-lg">
            <div>
                <h3 className="text-sm uppercase tracking-wide opacity-70">{title}</h3>
                {subtitle && <p className="text-xs opacity-60 mt-1">{subtitle}</p>}
            </div>
            {children}
        </div>
    )

    const row = ({ label, hint, children }) => (
        <div className="flex items-center justify-between gap-4 rounded-xl bg-white/10 px-3 py-2.5">
            <div>
                <div className="font-medium">{label}</div>
                {hint && <div className="text-xs opacity-65">{hint}</div>}
            </div>
            {children}
        </div>
    )

    const Toggle = ({ checked, onChange, accentColor }) => (
        <button
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${checked ? '' : 'bg-white/25'}`}
            style={checked ? { backgroundColor: accentColor } : {}}
        >
            <span
                className={`h-5 w-5 rounded-full bg-white shadow transition ${checked ? 'translate-x-6' : 'translate-x-1'}`}
            />
        </button>
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
                                <div className="rounded-xl bg-white/15 p-1 flex gap-1">
                                    <button
                                        className={`px-3 py-1.5 rounded-lg text-sm transition flex items-center gap-1 ${settings.theme === 'light' ? 'bg-white text-slate-900 shadow' : 'text-white/80 hover:bg-white/10'}`}
                                        onClick={() => updateSetting({ theme: 'light' })}
                                    >
                                        <i className="fa-regular fa-sun"/> Light
                                    </button>
                                    <button
                                        className={`px-3 py-1.5 rounded-lg text-sm transition flex items-center gap-1 ${settings.theme === 'dark' ? 'bg-slate-900 text-white shadow' : 'text-white/80 hover:bg-white/10'}`}
                                        onClick={() => updateSetting({ theme: 'dark' })}
                                    >
                                        <i className="fa-regular fa-moon"/> Dark
                                    </button>
                                </div>
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
                title: "Calendar",
                children: row({
                    label: "Week starts on",
                    hint: "Choose first day of week",
                    children: (
                        <select
                            className="rounded-lg bg-white px-2 py-1 text-slate-900 outline-none border border-white/40"
                            value={settings.calendarWeekStartsOn ?? 1}
                            onChange={e => updateSetting({ calendarWeekStartsOn: Number(e.target.value) })}
                        >
                            <option value={0} className="text-slate-900 bg-white">Sunday</option>
                            <option value={1} className="text-slate-900 bg-white">Monday</option>
                        </select>
                    )
                })
            })}

            {section({
                title: "Clock",
                children: (
                    <div className="space-y-3">
                        {row({
                            label: "Show seconds",
                            hint: "Display HH:MM:SS instead of HH:MM",
                            children: <Toggle checked={!!settings.clockShowSeconds} onChange={value => updateSetting({ clockShowSeconds: value })} accentColor={settings.accentColor || '#3b82f6'} />
                        })}
                        {row({
                            label: "Show date",
                            hint: "Display the current date under the time",
                            children: <Toggle checked={!!settings.clockShowDate} onChange={value => updateSetting({ clockShowDate: value })} accentColor={settings.accentColor || '#3b82f6'} />
                        })}
                    </div>
                )
            })}
        </div>
    )
}
