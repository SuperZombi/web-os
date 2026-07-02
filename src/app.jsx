const App = () => {
	const [windows, setWindows] = React.useState([])
	const [settings, setSettings] = React.useState(() => window.SettingsManager.get())

	React.useEffect(() => {
		window.WindowManager.subscribe(setWindows)
		return window.SettingsManager.subscribe(setSettings)
	}, [])

	React.useEffect(() => {
		window.loadApplication("apps/settings/manifest.json")
		window.loadApplication("apps/start_menu/manifest.json")
		window.loadApplication("apps/calculator/manifest.json")
		window.loadApplication("apps/calendar/manifest.json")
		window.loadApplication("apps/test/manifest.json")
	}, [])

	const [welcomeAudioPlayed, setWelcomeAudioPlayed] = React.useState(false)
	const playWelcomeSound = () => {
		if (!welcomeAudioPlayed){
			window.SoundManager.playWelcomeSound(_=>{
				setWelcomeAudioPlayed(true)
			}, err=>{
				console.warn("Blocked autoplay:", err)
				const handler = () => {
					playWelcomeSound()
					document.removeEventListener("click", handler)
				}
				document.addEventListener("click", handler)
			})
		}
	}
	React.useEffect(() => {
		playWelcomeSound()
	}, [])

	const { theme, accentColor, clockShowSeconds, clockShowDate, wallpaper } = settings

	return (
		<React.Fragment>
			<img
				className="h-full w-full object-cover select-none"
				src={window.SettingsManager.wallpapers[wallpaper]}
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
