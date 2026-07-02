(() => {
    const Section = ({ title, subtitle, children }) => (
        <div className="rounded-2xl border border-white/15 bg-black/25 p-4 space-y-3 shadow-lg">
            <div>
                <h3 className="text-sm uppercase tracking-wide opacity-70">{title}</h3>
                {subtitle && <p className="text-xs opacity-60 mt-1">{subtitle}</p>}
            </div>
            <div className="space-y-3">
                {children}
            </div>
        </div>
    )

    const Row = ({ label, hint, children }) => (
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

    const Select = ({
        value, onChange, options, theme, accentColor
    }) => (
        <div className="relative">
            <select
                value={value}
                onChange={e=>onChange(e.target.value)}
                className={`
                    appearance-none bg-black/25 text-white
                    px-3 py-2 pr-8 rounded-lg border border-white/15
                    shadow-lg backdrop-blur-sm outline-none
                    transition-all duration-200 hover:border-white/30
                    focus:ring-2 ${`focus:border-[${accentColor}]/60 focus:ring-[${accentColor}]/20`}
                `}
            >
                {options.map(option => (
                    <option
                        key={option.value}
                        value={option.value}
                        className={`
                            ${theme === "dark" ? "bg-zinc-900 text-white" : "bg-white text-black"}
                            ${option.value === value ? "font-semibold" : ""}
                        `}
                    >
                        {option.label}
                    </option>
                ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-white/60">
                <svg
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    />
                </svg>
            </div>
        </div>
    )

    const accentOptions = ["#3b82f6", "#8b5cf6", "#14b8a6", "#f59e0b", "#ef4444", "#22c55e"]
    const soundOptions = [
        { value: "95", label: "Windows 95" },
        { value: "xp", label: "Windows XP" },
        { value: "longhorn", label: "Longhorn" },
        { value: "7", label: "Windows 7" },
        { value: "11", label: "Windows 11" },
    ]
    const weekStartOptions = [
        { value: 0, label: "Sunday" },
        { value: 1, label: "Monday" },
    ]

    return ({ api }) => {
        const [settings, setSettings] = React.useState(api.settings.get())

        React.useEffect(() => api.settings.subscribe(setSettings), [api])

        const updateSetting = (next) => api.settings.update(next)

        return (
            <div className="h-full overflow-auto p-4 text-white bg-gradient-to-b from-black/20 to-black/40 space-y-4"
                style={{scrollbarColor: `${settings.accentColor} ${settings.theme === "dark" ? "#090f1a" : "#757a75"}`}}
            >
                <Section title="Appearance">
                    <Row label="Theme" hint={settings.theme === 'dark' ? 'Dark mode is active' : 'Light mode is active'}>
                        <div className="rounded-xl bg-white/15 p-1 flex gap-1">
                            <button
                                className={`px-3 py-1.5 rounded-lg text-sm transition flex items-center gap-1 text-white/80 ${settings.theme === 'light' ? 'shadow' : 'hover:bg-white/10'}`}
                                onClick={() => updateSetting({ theme: 'light' })}
                                style={{backgroundColor: settings.theme === 'light' && settings.accentColor}}
                            >
                                <i className="fa-regular fa-sun"/> Light
                            </button>
                            <button
                                className={`px-3 py-1.5 rounded-lg text-sm transition flex items-center gap-1 text-white/80 ${settings.theme === 'dark' ? 'shadow' : 'hover:bg-white/10'}`}
                                onClick={() => updateSetting({ theme: 'dark' })}
                                style={{backgroundColor: settings.theme === 'dark' && settings.accentColor}}
                            >
                                <i className="fa-regular fa-moon"/> Dark
                            </button>
                        </div>
                    </Row>

                    <Row label="Accent color">
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
                    </Row>
                </Section>
                <Section title="Sounds">
                    <Row label="System sounds">
                        <Select
                            value={settings.soundsStyle ?? "11"}
                            onChange={val => updateSetting({ soundsStyle: val })}
                            options={soundOptions}
                            theme={settings.theme}
                            accentColor={settings.accentColor}
                        />
                    </Row>
                </Section>

                <Section title="Calendar & Clock">
                    <Row label="Week starts on" hint="Choose first day of week">
                        <Select
                            value={settings.calendarWeekStartsOn ?? 1}
                            onChange={val => updateSetting({ calendarWeekStartsOn: Number(val) })}
                            options={weekStartOptions}
                            theme={settings.theme}
                            accentColor={settings.accentColor}
                        />
                    </Row>
                    <Row label="Show seconds" hint="Display HH:MM:SS instead of HH:MM">
                        <Toggle checked={!!settings.clockShowSeconds} onChange={value => updateSetting({ clockShowSeconds: value })} accentColor={settings.accentColor}/>
                    </Row>
                    <Row label="Show date" hint="Display the current date under the time">
                        <Toggle checked={!!settings.clockShowDate} onChange={value => updateSetting({ clockShowDate: value })} accentColor={settings.accentColor}/>
                    </Row>
                </Section>
            </div>
        )
    }
})()
