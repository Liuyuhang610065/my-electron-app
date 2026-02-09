const { app, BrowserWindow, ipcMain} = require('electron/main')
const path = require('node:path')

// 配置自动更新
require('update-electron-app')({
    repo: 'Liuyuhang610065/my-electron-app',
    updateInterval: '1 hour',
    logger: console
})

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    win.loadFile('index.html')
    
    // 在开发模式下自动打开开发者工具
    if (process.env.NODE_ENV === 'development') {
        win.webContents.openDevTools()
    }
}

app.whenReady().then(() => {
    ipcMain.handle('ping', () => 'pong')
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
