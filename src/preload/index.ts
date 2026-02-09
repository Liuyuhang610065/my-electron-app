import { contextBridge, ipcRenderer } from 'electron'
import type { IElectronAPI } from './index.d'

const api: IElectronAPI = {
  ping: () => ipcRenderer.invoke('ping'),
  getVersions: () => ({
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  })
}

contextBridge.exposeInMainWorld('electronAPI', api)
