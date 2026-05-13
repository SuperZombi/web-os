const App = () => {
	const [windows, setWindows] = React.useState([])
	const [settings, setSettings] = React.useState(() => window.SettingsManager.get())

	React.useEffect(() => {
		window.WindowManager.subscribe(setWindows)
		return window.SettingsManager.subscribe(setSettings)
	}, [])

	React.useEffect(() => {
		window.loadApplication("/apps/settings/manifest.json")
		window.loadApplication("/apps/start_menu/manifest.json")
	}, [])

	const { theme, accentColor, clockShowSeconds, clockShowDate } = settings

	return (
		<React.Fragment>
			<img
				className="h-full w-full object-cover select-none"
				src={theme === 'dark' ? "src/images/dark.jpeg" : "src/images/light.jpg"}
				draggable={false}
			/>
			<TaskBar theme={theme} apps={windows} accentColor={accentColor} clockShowSeconds={clockShowSeconds} clockShowDate={clockShowDate}/>

			{windows.map(win => (
				<Window key={win.id} win={win} theme={theme} accentColor={accentColor}>
					{win.component}
				</Window>
			))}
		</React.Fragment>
	)
}

ReactDOM.createRoot(
	document.getElementById("root")
).render(<App/>)
