import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [pingResponse, setPingResponse] = useState<string>('')
  const versions = window.electronAPI.getVersions()

  useEffect(() => {
    window.electronAPI.ping().then((response) => {
      setPingResponse(response)
    })
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <h1>Hello from Electron + React + TypeScript!</h1>
        <p>👋</p>
      </header>
      <main className="app-content">
        <section className="version-info">
          <h2>Version Information</h2>
          <ul>
            <li>
              <strong>Node:</strong> {versions.node}
            </li>
            <li>
              <strong>Chrome:</strong> {versions.chrome}
            </li>
            <li>
              <strong>Electron:</strong> {versions.electron}
            </li>
          </ul>
        </section>
        <section className="ipc-demo">
          <h2>IPC Communication</h2>
          <p>
            Ping response: <code>{pingResponse || 'Loading...'}</code>
          </p>
        </section>
      </main>
    </div>
  )
}

export default App
