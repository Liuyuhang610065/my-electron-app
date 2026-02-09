import { autoUpdater } from 'electron-updater'
import { app } from 'electron'

export function setupAutoUpdater(): void {
  // Configure update feed
  autoUpdater.setFeedURL({
    provider: 'github',
    owner: 'Liuyuhang610065',
    repo: 'my-electron-app'
  })

  // Disable in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Auto-update disabled in development mode')
    return
  }

  // Check for updates on startup
  app.whenReady().then(() => {
    setTimeout(() => autoUpdater.checkForUpdates(), 3000)
  })

  // Check every hour
  setInterval(() => {
    autoUpdater.checkForUpdates()
  }, 60 * 60 * 1000)

  // Event handlers
  autoUpdater.on('update-available', (info) => {
    console.log('Update available:', info.version)
  })

  autoUpdater.on('update-downloaded', (info) => {
    console.log('Update downloaded:', info.version)
    autoUpdater.quitAndInstall()
  })

  autoUpdater.on('error', (err) => {
    console.error('Update error:', err)
  })
}
