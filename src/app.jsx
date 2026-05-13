const App = () => {
	const [windows, setWindows] = React.useState([])
	React.useEffect(() => {
		window.WindowManager.subscribe(setWindows)
	}, [])

	React.useEffect(() => {
	

		window.loadApplication("/apps/settings/manifest.json")
		
		.then(() => {
			window.AppManager.launchApp("settings")
			// OS.launchApplication("settings")
			// console.log(window.AppManager.registeredApps)
		})

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
				console.log(win.component)
				return (
					<Window key={win.id} win={win}>
						{win.component}
					</Window>
				)
			})}

			{/* <Window win={{width: 400, height: 400, name: "My App"}}>
				<div className="p-2">
					<h3>Lorem ipsum dolor sit amet consectetur adipisicing elit. Alias quam eos debitis dolores, deserunt perspiciatis, praesentium atque nisi reprehenderit rem quidem illo vitae fugiat unde natus nam! Pariatur, qui ea.</h3>
				</div>
			</Window> */}
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
