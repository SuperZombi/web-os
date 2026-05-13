const TaskBar = ({ theme, apps }) => {
	const [activeApp, setActiveApp] = React.useState(null)

	React.useEffect(() => {
		const active = window.WindowManager.getActiveWindow()
		setActiveApp(active ? active.id : null)
	}, [apps])
	return (
		<div className={`h-12 w-full absolute bottom-0 gap-2
			bg-${theme === 'dark' ? 'gray-800' : 'gray-600'}/50 backdrop-blur-sm
			flex items-center px-2 py-1
		`}>
			<TaskBarItem theme={theme} onClick={() => window.AppManager.launchApp("start_menu")}>
				<img className="h-full cursor-pointer" src="src/images/logo.png" draggable={false}/>
			</TaskBarItem>
			
			{apps.map(app => (
				!app.hidden && (
					<TaskBarItem key={app.id} theme={theme} onClick={() => window.WindowManager.focusWindow(app.id)}
						active={app.id === activeApp}
					>
						<img className="h-full cursor-pointer" src={app.icon} draggable={false}/>
					</TaskBarItem>
				)
			))}

			<Clock theme={theme}/>
		</div>
	)
}
const TaskBarItem = ({children, className, onClick, theme, active}) => {
	return (
		<div className={`
			cursor-pointer h-full rounded-lg p-1.5
			${active ? (theme === 'dark' ? 'bg-gray-600/75' : 'bg-gray-400/75') : ''}
			hover:bg-${theme === 'dark' ? 'gray-600/50' : 'gray-400/50'}
			transition duration-150 ease-in-out select-none
			${className}
		`} onClick={onClick}>
			{children}
		</div>
	)
}

const Clock = ({ theme }) => {
	const [time, setTime] = React.useState(new Date())
	const [showSeconds, setShowSeconds] = React.useState(false)
	const [showDate, setShowDate] = React.useState(false)

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
		return date.toLocaleDateString('ru-RU', {
			year: 'numeric',
			month: 'numeric',
			day: 'numeric'
		})
	}

	return (
		<TaskBarItem theme={theme} className="text-white ml-auto flex flex-col items-end justify-center select-none">
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
