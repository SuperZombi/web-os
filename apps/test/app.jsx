(() => {
    return ({ api }) => {    
        const theme = api.settings.get().theme
        const [message, setMessage] = React.useState(api.storage.get("message"))
        React.useEffect(() => {
            api.storage.set({ message: message })
        }, [message])
        return (
            <div className="text-lg my-4 flex flex-col gap-2 items-center">
                <h3>{message}</h3>
                <input className="bg-white text-black border border-gray-300"
                    type="text" value={message} onChange={(e) => setMessage(e.target.value)}
                />
            </div>
        )
    }
})()
