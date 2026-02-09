export interface IElectronAPI {
  ping: () => Promise<string>
  getVersions: () => {
    node: string
    chrome: string
    electron: string
  }
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}
