const TaskBar = ({ theme, apps, accentColor, clockShowSeconds, clockShowDate }) => {
	const [activeApp, setActiveApp] = React.useState(null)

	React.useEffect(() => {
		const active = window.WindowManager.getActiveWindow()
		setActiveApp(active && !active.minimized ? active.id : null)
	}, [apps])
	return (
		<div className={`h-12 w-full absolute bottom-0 gap-2 border-t
			${theme === 'dark' ? 'bg-slate-900/70 border-white/10' : 'bg-slate-100/75 border-black/10'} backdrop-blur-md
			flex items-center px-2 py-1.5
		`}>
			<TaskBarItem theme={theme} accentColor={accentColor} onClick={() => window.AppManager.launchApp("start_menu")}
				active={activeApp === "start_menu"}
			>
				<img className="h-full cursor-pointer" src="src/images/logo.png" draggable={false}/>
			</TaskBarItem>
			
			{apps.map(app => (
				!app.hidden && (
					<TaskBarItem key={app.id} theme={theme} accentColor={accentColor} onClick={() => window.WindowManager.toggleMinimizeWindow(app.id)}
						active={app.id === activeApp}
					>
						<img className="h-full cursor-pointer" src={app.icon} draggable={false}/>
					</TaskBarItem>
				)
			))}

			<Clock theme={theme} accentColor={accentColor} showSeconds={clockShowSeconds} showDate={clockShowDate}/>
		</div>
	)
}
const TaskBarItem = ({children, className="", onClick, theme, active, accentColor}) => {
	const [pressed, setPressed] = React.useState(false)
	return (
		<div className={`
			cursor-pointer h-full rounded-lg p-1.5 relative
			${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-black/10'}
			transition-all duration-200 ease-out select-none
			${active ? 'ring-1 scale-105' : ''}
			${pressed ? 'scale-95' : ''}
			animate-[taskbarItemIn_.2s_ease-out]
			${className}
		`} 
		style={{
			backgroundColor: active ? `${accentColor}44` : undefined,
			"--tw-ring-color": active ? `${accentColor}aa` : undefined
		}}
		onMouseDown={() => setPressed(true)}
		onMouseUp={() => setPressed(false)}
		onMouseLeave={() => setPressed(false)}
		onClick={onClick}>
			{children}
		</div>
	)
}

const Clock = ({ theme, showSeconds, showDate, accentColor }) => {
	const [time, setTime] = React.useState(new Date())

	React.useEffect(() => {
		const interval = setInterval(() => {
			setTime(new Date())
		}, 1000)

		return () => clearInterval(interval)
	}, [])

	const formatTime = (date) => {
		return date.toLocaleTimeString([], {
			hour: '2-digit',
			minute: '2-digit',
			second: showSeconds ? '2-digit' : undefined
		})
	}

	const formatDate = (date) => {
		return date.toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'numeric',
			day: 'numeric'
		})
	}

	return (
		<TaskBarItem theme={theme} accentColor={accentColor} className={`${theme === 'dark' ? 'text-white' : 'text-slate-800'} ml-auto flex flex-col items-end justify-center select-none`}
			onClick={_=>window.AppManager.launchApp("calendar")}
		>
			<div className={`${showDate ? "text-sm" : "text-base"}`}>
				{formatTime(time)}
			</div>

			{showDate && (
				<div className="text-xs opacity-70">
					{formatDate(time)}
				</div>
			)}
		</TaskBarItem>
	)
}
