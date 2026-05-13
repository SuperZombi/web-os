({ api }) => {
    const [now, setNow] = React.useState(() => new Date())
    const [cursor, setCursor] = React.useState(() => {
        const d = new Date()
        return new Date(d.getFullYear(), d.getMonth(), 1)
    })
    const [settings, setSettings] = React.useState(() => api.settings.get())

    React.useEffect(() => api.settings.subscribe(setSettings), [api])

    React.useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000 * 30)
        return () => clearInterval(timer)
    }, [])

    const isDark = settings.theme === 'dark'
    const accentColor = settings.accentColor || '#3b82f6'
    const weekStartsOn = settings.calendarWeekStartsOn ?? 1
    const monthLabel = cursor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })

    const rawStartWeekday = new Date(cursor.getFullYear(), cursor.getMonth(), 1).getDay()
    const startWeekday = (rawStartWeekday - weekStartsOn + 7) % 7
    const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate()
    const prevMonthDays = new Date(cursor.getFullYear(), cursor.getMonth(), 0).getDate()

    const dayNames = Array.from({ length: 7 }, (_, index) => {
        const dayNumber = (weekStartsOn + index) % 7
        const referenceDate = new Date(2024, 0, dayNumber + 7)
        return referenceDate.toLocaleDateString(undefined, { weekday: 'short' })
    })

    const cells = []
    for (let i = startWeekday - 1; i >= 0; i--) cells.push({ day: prevMonthDays - i, muted: true, monthOffset: -1, weekday: (cells.length + weekStartsOn) % 7 })
    for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, muted: false, monthOffset: 0, weekday: (cells.length + weekStartsOn) % 7 })
    while (cells.length < 42) cells.push({ day: cells.length - (startWeekday + daysInMonth) + 1, muted: true, monthOffset: 1, weekday: (cells.length + weekStartsOn) % 7 })

    const isToday = (cell) => {
        const date = new Date(cursor.getFullYear(), cursor.getMonth() + cell.monthOffset, cell.day)
        return date.toDateString() === now.toDateString()
    }

    const goToToday = () => {
        const d = new Date()
        setNow(d)
        setCursor(new Date(d.getFullYear(), d.getMonth(), 1))
    }

    return (
        <div className={`h-full p-4 ${isDark ? 'bg-slate-900/60 text-white' : 'bg-white/60 text-slate-900'}`}>
            <div className="flex items-center justify-between mb-4">
                <button className={`h-9 w-9 rounded-lg ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-slate-200/80 hover:bg-slate-300/80'}`} onClick={() => setCursor(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}>
                    <i className="fa-solid fa-chevron-left" />
                </button>
                <h2 className="text-xl font-semibold capitalize">{monthLabel}</h2>
                <button className={`h-9 w-9 rounded-lg ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-slate-200/80 hover:bg-slate-300/80'}`} onClick={() => setCursor(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}>
                    <i className="fa-solid fa-chevron-right" />
                </button>
            </div>

            <button
                className="mb-3 w-full rounded-xl py-2 font-medium text-white transition hover:opacity-90 select-none"
                style={{ backgroundColor: accentColor }}
                onClick={goToToday}
            >
                Today
            </button>

            <div className={`rounded-2xl p-3 ${isDark ? 'bg-black/30' : 'bg-white/70'} border ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                <div className="grid grid-cols-7 gap-2 mb-2">
                    {dayNames.map(d => <div key={d} className={`text-center text-xs font-semibold select-none ${isDark ? 'text-white/60' : 'text-slate-500'}`}>{d}</div>)}
                </div>

                <div className="grid grid-cols-7 gap-2">
                    {cells.map((cell, idx) => {
                        const todayCell = isToday(cell)
                        const weekendCell = cell.weekday === 0 || cell.weekday === 6
                        return (
                            <div
                                key={`${cell.day}-${idx}`}
                                className={`h-11 rounded-xl flex items-center justify-center text-sm font-medium transition select-none ${todayCell ? 'text-white shadow-lg' : cell.muted ? (isDark ? (weekendCell ? 'text-rose-400/45 bg-white/5' : 'text-white/35 bg-white/5') : (weekendCell ? 'text-rose-500 bg-slate-100/80' : 'text-slate-400 bg-slate-100/80')) : (isDark ? (weekendCell ? 'bg-white/10 text-rose-400' : 'bg-white/10 text-white') : (weekendCell ? 'bg-slate-100 text-rose-600' : 'bg-slate-100 text-slate-800'))}`}
                                style={todayCell ? { backgroundColor: accentColor, boxShadow: `0 10px 24px ${accentColor}55` } : {}}
                            >
                                {cell.day}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
