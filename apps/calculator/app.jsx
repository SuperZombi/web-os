({ api }) => {
    const theme = api.settings.get().theme
    const [display, setDisplay] = React.useState('0')
    const [stored, setStored] = React.useState(null)
    const [operator, setOperator] = React.useState(null)
    const [replaceDisplay, setReplaceDisplay] = React.useState(false)

    const isDark = theme === 'dark'

    const clearAll = () => {
        setDisplay('0')
        setStored(null)
        setOperator(null)
        setReplaceDisplay(false)
    }

    const inputDigit = (digit) => {
        if (replaceDisplay) {
            setDisplay(String(digit))
            setReplaceDisplay(false)
            return
        }

        setDisplay((prev) => (prev === '0' ? String(digit) : prev + String(digit)))
    }

    const applyOperator = (a, b, op) => {
        if (op === '+') return a + b
        if (op === '-') return a - b
        if (op === '×') return a * b
        if (op === '÷') return b === 0 ? null : a / b
        return b
    }

    const formatResult = (value) => {
        if (value === null || Number.isNaN(value) || !Number.isFinite(value)) return 'Error'
        const rounded = Math.round((value + Number.EPSILON) * 100000000) / 100000000
        return String(rounded)
    }

    const chooseOperator = (nextOperator) => {
        const current = Number(display)

        if (stored === null || operator === null) {
            setStored(current)
            setOperator(nextOperator)
            setReplaceDisplay(true)
            return
        }

        const result = applyOperator(stored, current, operator)
        const formatted = formatResult(result)
        setDisplay(formatted)

        if (formatted === 'Error') {
            setStored(null)
            setOperator(null)
            setReplaceDisplay(true)
            return
        }

        setStored(Number(formatted))
        setOperator(nextOperator)
        setReplaceDisplay(true)
    }

    const calculate = () => {
        if (stored === null || operator === null) return

        const current = Number(display)
        const result = applyOperator(stored, current, operator)
        const formatted = formatResult(result)
        setDisplay(formatted)
        setStored(formatted === 'Error' ? null : Number(formatted))
        setOperator(null)
        setReplaceDisplay(true)
    }

    const btnBase = `h-14 rounded-xl text-xl font-semibold transition active:scale-[0.98] ${
        isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-black/10 hover:bg-black/20 text-slate-900'
    }`

    const opBtn = `${btnBase} ${isDark ? 'bg-blue-500/70 hover:bg-blue-500' : 'bg-blue-500 text-white hover:bg-blue-600'}`
    const eqBtn = `${btnBase} ${isDark ? 'bg-emerald-500/80 hover:bg-emerald-500' : 'bg-emerald-500 text-white hover:bg-emerald-600'}`
    const clearBtn = `${btnBase} ${isDark ? 'bg-rose-500/80 hover:bg-rose-500' : 'bg-rose-500 text-white hover:bg-rose-600'}`

    const digits = [7, 8, 9, 4, 5, 6, 1, 2, 3, 0]

    return (
        <div className={`h-full p-4 ${isDark ? 'bg-slate-900/50 text-white' : 'bg-white/40 text-slate-900'}`}>
            <div className={`h-24 rounded-xl px-4 py-3 mb-4 flex items-end justify-end text-4xl font-semibold ${isDark ? 'bg-black/35' : 'bg-white/80'}`}>
                <span className="truncate max-w-full">{display}</span>
            </div>

            <div className="grid grid-cols-4 gap-3">
                <button className={clearBtn} onClick={clearAll}>C</button>
                <button className={opBtn} onClick={() => chooseOperator('÷')}>÷</button>
                <button className={opBtn} onClick={() => chooseOperator('×')}>×</button>
                <button className={opBtn} onClick={() => chooseOperator('-')}>-</button>

                {digits.slice(0, 9).map((digit) => (
                    <button key={digit} className={btnBase} onClick={() => inputDigit(digit)}>{digit}</button>
                ))}

                <button className={opBtn} onClick={() => chooseOperator('+')}>+</button>
                <button className={`${btnBase} col-span-2`} onClick={() => inputDigit(0)}>0</button>
                <button className={`${eqBtn} col-span-2`} onClick={calculate}>=</button>
            </div>
        </div>
    )
}
