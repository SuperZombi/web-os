const App = () => {
	const [windows, setWindows] = React.useState([])
	React.useEffect(() => {
		window.WindowManager.subscribe(setWindows)
	}, [])

	React.useEffect(() => {
		window.loadApplication("/apps/settings/manifest.json")
		window.loadApplication("/apps/start_menu/manifest.json")
	}, [])

	const { theme } = useApp().settings

	return (
		<React.Fragment>
			<img
				className="h-full w-full object-cover select-none"
				src={theme === 'dark' ? "src/images/dark.jpeg" : "src/images/light.jpg"}
				draggable={false}
			/>
			<TaskBar/>

			{windows.map(win => {
				return (
					<Window key={win.id} win={win}>
						{win.component}
					</Window>
				)
			})}
		</React.Fragment>
	)
}

ReactDOM.createRoot(
	document.getElementById("root")
).render(
	<AppProvider>
		<App/>
	</AppProvider>
)
