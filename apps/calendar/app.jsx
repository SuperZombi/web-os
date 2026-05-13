({ api }) => {
    const [now, setNow] = React.useState(() => new Date())
    const [cursor, setCursor] = React.useState(() => {
        const d = new Date()
        return new Date(d.getFullYear(), d.getMonth(), 1)
    })
    const [theme, setTheme] = React.useState(() => api.settings.get().theme)

    React.useEffect(() => api.settings.subscribe(next => setTheme(next.theme)), [api])

    React.useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000 * 30)
        return () => clearInterval(timer)
    }, [])

    const isDark = theme === 'dark'
    const monthLabel = cursor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })

    const startWeekday = new Date(cursor.getFullYear(), cursor.getMonth(), 1).getDay()
    const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate()
    const prevMonthDays = new Date(cursor.getFullYear(), cursor.getMonth(), 0).getDate()

    const cells = []

    for (let i = startWeekday - 1; i >= 0; i--) {
        cells.push({ day: prevMonthDays - i, muted: true, monthOffset: -1 })
    }

    for (let d = 1; d <= daysInMonth; d++) {
        cells.push({ day: d, muted: false, monthOffset: 0 })
    }

    while (cells.length < 42) {
        cells.push({ day: cells.length - (startWeekday + daysInMonth) + 1, muted: true, monthOffset: 1 })
    }

    const today = now
    const isToday = (cell) => {
        const date = new Date(cursor.getFullYear(), cursor.getMonth() + cell.monthOffset, cell.day)
        return date.toDateString() === today.toDateString()
    }

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    return (
        <div className={`h-full p-4 ${isDark ? 'bg-slate-900/60 text-white' : 'bg-white/60 text-slate-900'}`}>
            <div className="flex items-center justify-between mb-4">
                <button
                    className={`h-9 w-9 rounded-lg ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-slate-200/80 hover:bg-slate-300/80'}`}
                    onClick={() => setCursor(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                >
                    <i className="fa-solid fa-chevron-left" />
                </button>
                <h2 className="text-xl font-semibold capitalize">{monthLabel}</h2>
                <button
                    className={`h-9 w-9 rounded-lg ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-slate-200/80 hover:bg-slate-300/80'}`}
                    onClick={() => setCursor(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                >
                    <i className="fa-solid fa-chevron-right" />
                </button>
            </div>

            <div className={`rounded-2xl p-3 ${isDark ? 'bg-black/30' : 'bg-white/70'} border ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                <div className="grid grid-cols-7 gap-2 mb-2">
                    {dayNames.map(d => (
                        <div key={d} className={`text-center text-xs font-semibold ${isDark ? 'text-white/60' : 'text-slate-500'}`}>{d}</div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                    {cells.map((cell, idx) => {
                        const todayCell = isToday(cell)
                        return (
                            <div
                                key={`${cell.day}-${idx}`}
                                className={`h-11 rounded-xl flex items-center justify-center text-sm font-medium transition ${
                                    todayCell
                                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                                        : cell.muted
                                            ? (isDark ? 'text-white/35 bg-white/5' : 'text-slate-400 bg-slate-100/80')
                                            : (isDark ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-800')
                                }`}
                            >
                                {cell.day}
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className={`mt-4 rounded-xl px-4 py-3 ${isDark ? 'bg-white/5 text-white/85' : 'bg-slate-100 text-slate-700'}`}>
                <div className="text-xs uppercase tracking-wider opacity-70">Today</div>
                <div className="text-lg font-semibold">
                    {today.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>
                <div className="text-sm opacity-80">
                    {today.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
        </div>
    )
}
