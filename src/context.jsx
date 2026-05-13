const AppContext = React.createContext();
function AppProvider({children}) {
	const [settings, setSettings] = React.useState(() => window.SettingsManager.get())

	React.useEffect(() => {
		return window.SettingsManager.subscribe(setSettings)
	}, [])
	// React.useEffect(() => {
	// 	(async () => {
	// 		const loaded = await eel.get_settings()()
	// 		setSettings(prev => ({ ...prev, ...loaded }))
	// 	})()
	// }, [])
	const updateSetting = (key, value) => {
		window.SettingsManager.update({ [key]: value });
		// (async _=>{
		// 	await eel.update_settings({[key]: value})()
		// })()
	}
	
	// const [langData, setLangData] = React.useState({})
	// React.useEffect(() => {
	// 	fetch(`locales/${settings.language}.json`).then(res => res.json()).then(setLangData);
	// }, [settings.language])

	const value = {
		settings, updateSetting
	}
	return (
		<AppContext.Provider value={value}>
			{children}
		</AppContext.Provider>
	)
}
function useApp() {
	return React.useContext(AppContext)
}
