const Window = ({ win, children, theme, accentColor }) => {
	const MIN_WIDTH = 200;
	const MIN_HEIGHT = 120;
	const rootRef = React.useRef(null)
	const MAXIMIZE_ANIMATION_MS = 250

	function parseValue(value, total) { if (value === undefined || value === null) return undefined; if (typeof value === 'number') return { px: value, isPercent: false }; const str = String(value).trim(); if (str.endsWith('%')) { return { px: Math.floor((parseFloat(str) / 100) * total), isPercent: true }; } return { px: parseFloat(str), isPercent: false }; }
	function resolveWindowState(win) { const vw = window.innerWidth; const vh = window.innerHeight; const w = win?.width ?? Math.floor(vw / 2); const h = win?.height ?? Math.floor(vh / 2); let x; if (win?.left !== undefined) { const v = parseValue(win.left, vw); x = v.isPercent ? v.px - Math.floor(w / 2) : v.px } else if (win?.right !== undefined) { const v = parseValue(win.right, vw); x = v.isPercent ? vw - v.px - Math.floor(w / 2) : vw - w - v.px } else { x = Math.floor((vw - w) / 2) } let y; if (win?.top !== undefined) { const v = parseValue(win.top, vh); y = v.isPercent ? v.px - Math.floor(h / 2) : v.px } else if (win?.bottom !== undefined) { const v = parseValue(win.bottom, vh); y = v.isPercent ? vh - v.px - Math.floor(h / 2) : vh - h - v.px } else { y = Math.floor((vh - h) / 2) } x = Math.max(0, Math.min(x, vw - w)); y = Math.max(0, Math.min(y, vh - h)); return { w, h, x, y } }
	const [state, setState] = React.useState(() => resolveWindowState(win))
	const [isMaximized, setIsMaximized] = React.useState(false)
	const previousStateRef = React.useRef(null)
	const activate = React.useCallback(() => { window.WindowManager.focusWindow(win.id) }, [win.id])
	const startInteraction = React.useCallback((e, mode) => { e.preventDefault(); activate(); const startX = e.clientX; const startY = e.clientY; const s0 = { ...state }; const onMove = (e) => { const dx = e.clientX - startX; const dy = e.clientY - startY; let { x, y, w, h } = s0; if (mode === 'move') { x = Math.max(0, Math.min(s0.x + dx, window.innerWidth - w)); y = Math.max(0, Math.min(s0.y + dy, window.innerHeight - h)); } else { if (mode.includes('e')) { w = Math.max(MIN_WIDTH, Math.min(s0.w + dx, window.innerWidth - x)); } if (mode.includes('s')) { h = Math.max(MIN_HEIGHT, Math.min(s0.h + dy, window.innerHeight - y)); } if (mode.includes('w')) { const maxW = s0.x + s0.w; w = Math.max(MIN_WIDTH, Math.min(s0.w - dx, maxW)); x = Math.max(0, s0.x + s0.w - w); w = s0.x + s0.w - x; } if (mode.includes('n')) { const maxH = s0.y + s0.h; h = Math.max(MIN_HEIGHT, Math.min(s0.h - dy, maxH)); y = Math.max(0, s0.y + s0.h - h); h = s0.y + s0.h - y; } } setState({ x, y, w, h }); }; const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); }; window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp); }, [state, activate])
	const handle = (mode, style) => (<div style={{ position: 'absolute', zIndex: 10, ...style }} onMouseDown={e => startInteraction(e, mode)} />)
	const dragabble = win?.drag ?? true; const resizable = win?.resize ?? true; const showHeader = win?.header ?? true
	React.useEffect(() => { if (showHeader) return; const handlePointerDown = (e) => { if (rootRef.current && !rootRef.current.contains(e.target)) { window.WindowManager.closeWindow(win.id) } }; document.addEventListener('pointerdown', handlePointerDown); return () => document.removeEventListener('pointerdown', handlePointerDown) }, [showHeader, win.id])
	const [show, setShow] = React.useState(false)
	const [animateStateChange, setAnimateStateChange] = React.useState(false)
	const [isMinimized, setIsMinimized] = React.useState(!!win.minimized)
	React.useEffect(() => { setShow(true) }, [])
	React.useEffect(() => {
		setIsMinimized(!!win.minimized)
	}, [win.minimized])
	const toggleMaximize = React.useCallback(() => {
		activate()
		setAnimateStateChange(true)
		if (isMaximized) {
			if (previousStateRef.current) setState(previousStateRef.current)
			setIsMaximized(false)
		} else {
			previousStateRef.current = { ...state }
			setState({ x: 0, y: 0, w: window.innerWidth, h: window.innerHeight - 48 })
			setIsMaximized(true)
		}
	}, [activate, isMaximized, state])
	React.useEffect(() => {
		if (!animateStateChange) return
		const timer = window.setTimeout(() => setAnimateStateChange(false), MAXIMIZE_ANIMATION_MS)
		return () => window.clearTimeout(timer)
	}, [animateStateChange])
	React.useEffect(() => {
		if (!isMaximized) return
		const syncSize = () => setState({ x: 0, y: 0, w: window.innerWidth, h: window.innerHeight - 48 })
		window.addEventListener('resize', syncSize)
		return () => window.removeEventListener('resize', syncSize)
	}, [isMaximized])
	return (
		<div
			ref={rootRef}
			onMouseDown={activate}
			className={`window absolute ${isMaximized ? 'rounded-none' : 'rounded-xl'} border shadow-2xl overflow-hidden ${theme === 'dark' ? 'bg-slate-900/65 border-white/15' : 'bg-white/75 border-slate-300/80'} backdrop-blur-xl`}
			style={{
				width: state.w,
				height: state.h,
				left: state.x,
				top: state.y,
				boxShadow: `0 20px 45px ${theme === 'dark' ? '#0008' : '#33415522'}`,
				opacity: isMinimized ? 0 : (show ? 1 : 0),
				transform: isMinimized ? 'translateY(4rem) scale(0.9)' : (show ? 'translateY(0)' : 'translateY(2.5rem)'),
				pointerEvents: isMinimized ? 'none' : 'auto',
				visibility: isMinimized ? 'hidden' : 'visible',
				transition: [
				'opacity 200ms ease-out',
				'transform 200ms ease-out',
				'visibility 200ms linear',
				...(animateStateChange
					? ['left 200ms ease-in-out', 'top 200ms ease-in-out',
					'width 200ms ease-in-out', 'height 200ms ease-in-out']
					: [])
				].join(', ')
		}}>
			{showHeader && (<div className={`h-10 px-3 select-none flex items-center justify-center relative border-b ${dragabble && !isMaximized ? "cursor-move" : ""} ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-black/10 bg-white/40'}`} onMouseDown={dragabble && !isMaximized ? ((e) => startInteraction(e, 'move')) : null}>
				<h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{win?.name}</h3>
				<div className="absolute right-2 flex gap-1.5">
					<i className="cursor-pointer fa-solid fa-window-minimize h-6 w-6 rounded-full text-white text-xs flex items-center justify-center" style={{ backgroundColor: accentColor }} onClick={() => window.WindowManager.minimizeWindow(win.id)}></i>
					{resizable && (
						<i className={`cursor-pointer fa-solid ${isMaximized ? 'fa-compress' : 'fa-expand'} h-6 w-6 rounded-full text-white text-xs flex items-center justify-center`} style={{ backgroundColor: accentColor }} onClick={toggleMaximize}></i>
					)}
					<i className="cursor-pointer fa-solid fa-xmark h-6 w-6 rounded-full text-white text-base flex items-center justify-center" style={{ backgroundColor: accentColor }} onClick={() => {window.WindowManager.closeWindow(win.id)}}></i>
				</div>
			</div>)}
			<div className={`overflow-auto ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`} style={{ height: 'calc(100% - 41px)' }}>{children}</div>
			{resizable && !isMaximized && (<React.Fragment>{handle('n', { top: -4, left: 8, right: 8, height: 8, cursor: 'n-resize' })}{handle('s', { bottom: -4, left: 8, right: 8, height: 8, cursor: 's-resize' })}{handle('w', { left: -4, top: 8, bottom: 8, width: 8, cursor: 'w-resize' })}{handle('e', { right: -4, top: 8, bottom: 8, width: 8, cursor: 'e-resize' })}{handle('nw', { top: -5, left: -5, width: 14, height: 14, cursor: 'nw-resize' })}{handle('ne', { top: -5, right: -5, width: 14, height: 14, cursor: 'ne-resize' })}{handle('sw', { bottom: -5, left: -5, width: 14, height: 14, cursor: 'sw-resize' })}{handle('se', { bottom: -5, right: -5, width: 14, height: 14, cursor: 'se-resize' })}</React.Fragment>)}
		</div>
	)
}
