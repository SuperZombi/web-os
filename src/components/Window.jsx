const Window = ({ win, children, theme }) => {
	const MIN_WIDTH = 200;
	const MIN_HEIGHT = 120;
	const rootRef = React.useRef(null)

	function parseValue(value, total) {
		if (value === undefined || value === null) return undefined
		if (typeof value === 'number') return { px: value, isPercent: false }
		const str = String(value).trim()
		if (str.endsWith('%')) {
			return { px: Math.floor((parseFloat(str) / 100) * total), isPercent: true }
		}
		return { px: parseFloat(str), isPercent: false }
	}

	function resolveWindowState(win) {
		const vw = window.innerWidth
		const vh = window.innerHeight
		const w = win?.width  ?? Math.floor(vw / 2)
		const h = win?.height ?? Math.floor(vh / 2)
		let x
		if (win?.left !== undefined) {
			const v = parseValue(win.left, vw)
			x = v.isPercent ? v.px - Math.floor(w / 2) : v.px
		} else if (win?.right !== undefined) {
			const v = parseValue(win.right, vw)
			x = v.isPercent ? vw - v.px - Math.floor(w / 2) : vw - w - v.px
		} else {
			x = Math.floor((vw - w) / 2)
		}
		let y
		if (win?.top !== undefined) {
			const v = parseValue(win.top, vh)
			y = v.isPercent ? v.px - Math.floor(h / 2) : v.px
		} else if (win?.bottom !== undefined) {
			const v = parseValue(win.bottom, vh)
			y = v.isPercent ? vh - v.px - Math.floor(h / 2) : vh - h - v.px
		} else {
			y = Math.floor((vh - h) / 2)
		}
		x = Math.max(0, Math.min(x, vw - w))
		y = Math.max(0, Math.min(y, vh - h))
		return { w, h, x, y }
	}

	const [state, setState] = React.useState(() => resolveWindowState(win))

	const activate = React.useCallback(() => {
		window.WindowManager.activateWindow(win.id)
	}, [win.id])

	const startInteraction = React.useCallback((e, mode) => {
		e.preventDefault();
		activate()
		const startX = e.clientX;
		const startY = e.clientY;
		const s0 = { ...state };

		const onMove = (e) => {
			const dx = e.clientX - startX;
			const dy = e.clientY - startY;
			let { x, y, w, h } = s0;

			if (mode === 'move') {
				x = Math.max(0, Math.min(s0.x + dx, window.innerWidth  - w));
				y = Math.max(0, Math.min(s0.y + dy, window.innerHeight - h));
			} else {
				if (mode.includes('e')) {
					w = Math.max(MIN_WIDTH, Math.min(s0.w + dx, window.innerWidth - x));
				}
				if (mode.includes('s')) {
					h = Math.max(MIN_HEIGHT, Math.min(s0.h + dy, window.innerHeight - y));
				}
				if (mode.includes('w')) {
					const maxW = s0.x + s0.w;
					w = Math.max(MIN_WIDTH, Math.min(s0.w - dx, maxW));
					x = Math.max(0, s0.x + s0.w - w);
					w = s0.x + s0.w - x;
				}
				if (mode.includes('n')) {
					const maxH = s0.y + s0.h;
					h = Math.max(MIN_HEIGHT, Math.min(s0.h - dy, maxH));
					y = Math.max(0, s0.y + s0.h - h);
					h = s0.y + s0.h - y;
				}
			}

			setState({ x, y, w, h });
		};

		const onUp = () => {
			window.removeEventListener('mousemove', onMove);
			window.removeEventListener('mouseup', onUp);
		};

		window.addEventListener('mousemove', onMove);
		window.addEventListener('mouseup', onUp);
	}, [state, activate])

	const handle = (mode, style) => (
		<div
			style={{ position: 'absolute', zIndex: 10, ...style }}
			onMouseDown={e => startInteraction(e, mode)}
		/>
	)

	const dragabble = win?.drag ?? true
	const resizable = win?.resize ?? true
	const showHeader = win?.header ?? true

	React.useEffect(() => {
		if (showHeader) return
		const handlePointerDown = (e) => {
			if (rootRef.current && !rootRef.current.contains(e.target)) {
				window.WindowManager.closeWindow(win.id)
			}
		}
		document.addEventListener('pointerdown', handlePointerDown)
		return () => document.removeEventListener('pointerdown', handlePointerDown)
	}, [showHeader, win.id])

	const [show, setShow] = React.useState(false)

	React.useEffect(() => {
		setShow(true)
	}, [])

	return (
		<div
			ref={rootRef}
			onMouseDown={activate}
			className={`window absolute bg-${theme === 'dark' ? 'gray-800' : 'gray-100'}/50 backdrop-blur-lg rounded-lg border border-${theme === 'dark' ? 'gray-600' : 'gray-400'}/50 shadow-lg overflow-hidden
				${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-opacity transition-transform duration-300 ease-out
			`}
			style={{ width: state.w, height: state.h, left: state.x, top: state.y }}
		>
			{showHeader && (
				<div
					className={`bg-${theme === 'dark' ? 'gray-400' : 'white'}/25 border-b border-${theme === 'dark' ? 'gray-600' : 'gray-400'}/50 h-8 px-2 select-none
						flex items-center justify-center relative
						${dragabble && "cursor-move"}
					`}
					onMouseDown={dragabble ? ((e) => startInteraction(e, 'move')) : null}
				>
					<h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{win?.name}</h3>
					<div className="absolute right-2">
						<div className="relative h-5 w-5 flex items-center justify-center cursor-pointer
							text-red-500 hover:text-red-700 transition duration-150 ease-in-out"
							onClick={() => {window.WindowManager.closeWindow(win.id)}}
						>
							<i className="fa-solid fa-circle-xmark text-lg" style={{lineHeight: 1}}></i>
							<span className="bg-white absolute h-2.5 w-2.5 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 rounded-full"></span>
						</div>
					</div>
				</div>
			)}

			<div className={`overflow-auto ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`} style={{ height: 'calc(100% - 41px)' }}>
				{children}
			</div>

			{resizable && (
			<React.Fragment>
				{handle('n',  { top: -4,    left: 8,    right: 8,    height: 8,  cursor: 'n-resize' })}
				{handle('s',  { bottom: -4, left: 8,    right: 8,    height: 8,  cursor: 's-resize' })}
				{handle('w',  { left: -4,   top: 8,     bottom: 8,   width: 8,   cursor: 'w-resize' })}
				{handle('e',  { right: -4,  top: 8,     bottom: 8,   width: 8,   cursor: 'e-resize' })}

				{handle('nw', { top: -5,    left: -5,   width: 14, height: 14, cursor: 'nw-resize' })}
				{handle('ne', { top: -5,    right: -5,  width: 14, height: 14, cursor: 'ne-resize' })}
				{handle('sw', { bottom: -5, left: -5,   width: 14, height: 14, cursor: 'sw-resize' })}
				{handle('se', { bottom: -5, right: -5,  width: 14, height: 14, cursor: 'se-resize' })}
			</React.Fragment>
			)}
		</div>
	)
}
