(() => {
    const Button = ({ variant = 'default', accentColor, isDark, onClick, children }) => {
        const base = "h-14 rounded-xl text-xl font-semibold select-none transition active:scale-[0.98]"

        const variants = {
            default: isDark
                ? 'bg-white/10 hover:bg-white/20 text-white'
                : 'bg-black/10 hover:bg-black/20 text-slate-900',

            operator: isDark
                ? `!bg-[${accentColor}]/70 hover:!bg-[${accentColor}]/80`
                : `!bg-[${accentColor}] text-white hover:!bg-[${accentColor}]/80`,

            equal: isDark
                ? '!bg-emerald-500/80 hover:!bg-emerald-500'
                : '!bg-emerald-500 text-white hover:!bg-emerald-600',

            clear: isDark
                ? '!bg-rose-500/80 hover:!bg-rose-500'
                : '!bg-rose-500 text-white hover:!bg-rose-600'
        }

        return (
            <button
                className={`${base} ${variants[variant]}`}
                onClick={onClick}
            >
                {children}
            </button>
        )
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
    
    return ({ api }) => {
        const [theme, setTheme] = React.useState(api.settings.get().theme)
        const [accentColor, setAccentColor] = React.useState(api.settings.get().accentColor)
        React.useEffect(() => api.settings.subscribe(settings=>{
            setTheme(settings.theme)
            setAccentColor(settings.accentColor)
        }), [api])
        const isDark = theme === 'dark'
        const [display, setDisplay] = React.useState('0')
        const [stored, setStored] = React.useState(null)
        const [operator, setOperator] = React.useState(null)
        const [replaceDisplay, setReplaceDisplay] = React.useState(false)

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

        return (
            <div className={`h-full p-4 ${
                isDark
                    ? 'bg-slate-900/50 text-white'
                    : 'bg-white/40 text-slate-900'
            }`}>
                <div className={`h-24 rounded-xl px-4 py-3 mb-4 flex flex-col justify-end ${
                    isDark ? 'bg-black/35' : 'bg-white/80'
                }`}>
                    <div className={`text-sm mb-1 ${
                        isDark ? 'text-white/50' : 'text-slate-500'
                    }`}>
                        {stored !== null && operator
                            ? `${stored} ${operator} ${replaceDisplay ? '' : display}`
                            : ''}
                    </div>

                    <div className="flex justify-end text-4xl font-semibold">
                        <span className="truncate max-w-full">{display}</span>
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-3">
                    <Button isDark={isDark} onClick={() => inputDigit(7)}>7</Button>
                    <Button isDark={isDark} onClick={() => inputDigit(8)}>8</Button>
                    <Button isDark={isDark} onClick={() => inputDigit(9)}>9</Button>

                    <Button variant="operator" isDark={isDark} accentColor={accentColor}
                        onClick={() => chooseOperator('÷')}>÷</Button>

                    <Button isDark={isDark} onClick={() => inputDigit(4)}>4</Button>
                    <Button isDark={isDark} onClick={() => inputDigit(5)}>5</Button>
                    <Button isDark={isDark} onClick={() => inputDigit(6)}>6</Button>

                    <Button variant="operator" isDark={isDark} accentColor={accentColor}
                        onClick={() => chooseOperator('×')}>×</Button>

                    <Button isDark={isDark} onClick={() => inputDigit(1)}>1</Button>
                    <Button isDark={isDark} onClick={() => inputDigit(2)}>2</Button>
                    <Button isDark={isDark} onClick={() => inputDigit(3)}>3</Button>

                    <Button variant="operator" isDark={isDark} accentColor={accentColor}
                        onClick={() => chooseOperator('-')}>-</Button>

                    <Button variant="clear" isDark={isDark} onClick={clearAll}>C</Button>
                    <Button isDark={isDark} onClick={() => inputDigit(0)}>0</Button>
                    <Button variant="equal" isDark={isDark} onClick={calculate}>=</Button>

                    <Button variant="operator" isDark={isDark} accentColor={accentColor}
                        onClick={() => chooseOperator('+')}>+</Button>
                </div>
            </div>
        )
    }
})()
