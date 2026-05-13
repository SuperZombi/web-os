const AppContext = React.createContext();
function AppProvider({children}) {
	const supportedLangs = ["en", "ru", "uk"]
	const userLang = navigator.language?.slice(0, 2)
	const defaultSettings = {
		language: supportedLangs.includes(userLang) ? userLang : 'en',
        theme: 'dark',
	}
	const [settings, setSettings] = React.useState(defaultSettings)
	// React.useEffect(() => {
	// 	(async () => {
	// 		const loaded = await eel.get_settings()()
	// 		setSettings(prev => ({ ...prev, ...loaded }))
	// 	})()
	// }, [])
	const updateSetting = (key, value) => {
		setSettings(prev => ({ ...prev, [key]: value }));
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
