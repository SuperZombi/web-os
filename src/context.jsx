const AppContext = React.createContext();
function AppProvider({children}) {
	const [settings, setSettings] = React.useState(() => window.SettingsManager.get())

	React.useEffect(() => {
		return window.SettingsManager.subscribe(setSettings)
	}, [])
	const updateSetting = (key, value) => {
		window.SettingsManager.update({ [key]: value });
	}
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
