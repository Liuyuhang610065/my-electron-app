# Electron + Vite + React + TypeScript 迁移设计文档

## 概述

本文档描述将现有的基础 Electron 应用（原生 HTML/JS + Electron Forge）完全重构为使用 electron-vite + React + TypeScript 的现代架构方案。

## 设计决策

### 迁移策略
- **完全重构**：从零开始搭建新架构，获得最佳的项目结构和类型安全
- **方案选择**：使用 electron-vite 官方模板 + electron-builder

### 技术栈选择
- **构建工具**：electron-vite（替代 Electron Forge）
- **打包工具**：electron-builder（替代 Electron Forge）
- **前端框架**：React 18 + TypeScript
- **UI 框架**：无（纯 React + 自定义 CSS）
- **自动更新**：electron-updater（替代 update-electron-app）

### 功能保留
- ✅ IPC 通信机制（ping/pong 示例）
- ✅ 自动更新功能
- ✅ Electron Forge 的打包能力（迁移到 electron-builder）
- ❌ 环境变量配置（不保留）

## 项目结构设计

```
my-electron-app/
├── src/
│   ├── main/              # 主进程 (TypeScript)
│   │   ├── index.ts       # 主进程入口
│   │   └── update.ts      # 自动更新逻辑
│   ├── preload/           # 预加载脚本 (TypeScript)
│   │   ├── index.ts       # 暴露 API 到渲染进程
│   │   └── index.d.ts     # TypeScript 类型定义
│   └── renderer/          # 渲染进程 (React + TypeScript)
│       ├── src/
│       │   ├── App.tsx    # 根组件
│       │   ├── main.tsx   # React 入口
│       │   └── App.css    # 样式
│       └── index.html     # HTML 模板
├── resources/             # 应用资源（图标等）
├── out/                   # 构建输出
├── electron.vite.config.ts  # Vite 配置
├── electron-builder.yml     # 打包配置
├── package.json
├── tsconfig.json          # TypeScript 基础配置
├── tsconfig.node.json     # 主进程/预加载脚本 TS 配置
└── tsconfig.web.json      # 渲染进程 TS 配置
```

### 架构特点
- **三进程分离**：主进程、预加载脚本、渲染进程各自独立
- **环境区分**：主进程和预加载使用 Node.js 环境，渲染进程使用浏览器环境
- **模块化设计**：自动更新逻辑抽离为独立模块

## 技术栈和依赖

### 核心依赖
```json
{
  "dependencies": {
    "electron-updater": "^6.1.7"
  },
  "devDependencies": {
    "electron": "^40.2.1",
    "electron-vite": "^2.0.0",
    "electron-builder": "^24.9.1",
    "vite": "^5.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/node": "^20.0.0",
    "typescript": "^5.3.0",
    "@vitejs/plugin-react": "^4.2.0"
  }
}
```

### NPM 脚本
```json
{
  "scripts": {
    "dev": "electron-vite dev",
    "build": "electron-vite build",
    "preview": "electron-vite preview",
    "package": "electron-builder",
    "publish": "electron-builder --publish always"
  }
}
```

### 关键依赖说明
- **electron-vite**：处理主进程/预加载/渲染进程的编译和 HMR
- **electron-builder**：负责打包和发布（支持 Windows/macOS/Linux）
- **electron-updater**：自动更新功能，与 electron-builder 无缝集成

## IPC 通信机制设计

### 类型安全的 IPC 架构

#### 1. 共享类型定义 (`src/preload/index.d.ts`)
```typescript
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
```

#### 2. 预加载脚本 (`src/preload/index.ts`)
```typescript
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  ping: () => ipcRenderer.invoke('ping'),
  getVersions: () => ({
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  })
})
```

#### 3. 主进程处理 (`src/main/index.ts`)
```typescript
import { app, BrowserWindow, ipcMain } from 'electron'
import { setupAutoUpdater } from './update'

ipcMain.handle('ping', () => {
  return 'pong'
})

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js')
    }
  })

  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:5173')
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  setupAutoUpdater()
  createWindow()
})
```

#### 4. React 组件使用 (`src/renderer/src/App.tsx`)
```typescript
function App() {
  const [response, setResponse] = useState<string>('')
  const versions = window.electronAPI.getVersions()

  useEffect(() => {
    window.electronAPI.ping().then(setResponse)
  }, [])

  return (
    <div>
      <h1>Hello from Electron + React + TypeScript!</h1>
      <p>Node: {versions.node}</p>
      <p>Chrome: {versions.chrome}</p>
      <p>Electron: {versions.electron}</p>
      <p>Ping response: {response}</p>
    </div>
  )
}
```

### IPC 设计优势
- 完整的端到端类型检查
- IntelliSense 支持
- 编译时错误检测
- 易于扩展新的 IPC 通道

## 自动更新机制设计

### 更新模块 (`src/main/update.ts`)
```typescript
import { autoUpdater } from 'electron-updater'
import { app } from 'electron'

export function setupAutoUpdater() {
  // 配置更新源
  autoUpdater.setFeedURL({
    provider: 'github',
    owner: 'Liuyuhang610065',
    repo: 'my-electron-app'
  })

  // 开发模式下禁用自动更新
  if (process.env.NODE_ENV === 'development') {
    autoUpdater.checkForUpdates = () => {
      console.log('Auto-update disabled in development')
      return Promise.resolve(null as any)
    }
    return
  }

  // 每小时检查一次更新
  setInterval(() => {
    autoUpdater.checkForUpdates()
  }, 60 * 60 * 1000)

  // 启动时检查
  app.whenReady().then(() => {
    autoUpdater.checkForUpdates()
  })

  // 更新下载完成后自动安装
  autoUpdater.on('update-downloaded', () => {
    autoUpdater.quitAndInstall()
  })
}
```

### electron-builder 配置 (`electron-builder.yml`)
```yaml
appId: com.liuyuhang.myelectronapp
productName: my-electron-app
directories:
  output: out
files:
  - out/main
  - out/preload
  - out/renderer
publish:
  provider: github
  owner: Liuyuhang610065
  repo: my-electron-app
mac:
  category: public.app-category.utilities
win:
  target: nsis
linux:
  target: AppImage
```

### 自动更新特性
- GitHub Releases 作为更新源
- 每小时自动检查更新
- 开发模式自动禁用
- 静默下载，自动安装
- 可选：添加用户通知和进度显示

## 配置文件详解

### electron-vite 配置 (`electron.vite.config.ts`)
```typescript
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/main/index.ts')
        }
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/preload/index.ts')
        }
      }
    }
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve(__dirname, 'src/renderer/src')
      }
    },
    plugins: [react()]
  }
})
```

### TypeScript 配置

#### 基础配置 (`tsconfig.json`)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020"],
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "jsx": "react-jsx"
  },
  "references": [
    { "path": "./tsconfig.node.json" },
    { "path": "./tsconfig.web.json" }
  ]
}
```

#### Node 环境配置 (`tsconfig.node.json`)
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "composite": true,
    "types": ["node"]
  },
  "include": ["src/main/**/*", "src/preload/**/*"]
}
```

#### Web 环境配置 (`tsconfig.web.json`)
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "composite": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"]
  },
  "include": ["src/renderer/**/*"]
}
```

## 开发工作流

### 开发模式 (`npm run dev`)
- 自动启动 Electron 应用
- 主进程修改自动重启
- 渲染进程支持 HMR（热模块替换）
- TypeScript 实时编译检查
- 开发者工具自动打开

### 构建流程 (`npm run build`)
- 编译所有 TypeScript 代码
- 优化 React 生产构建
- 代码分割和压缩
- 输出到 `out/` 目录

### 打包发布 (`npm run publish`)
- 使用 electron-builder 打包
- 生成平台特定安装包
- 自动上传到 GitHub Releases
- 触发自动更新机制

## 迁移优势

### 相比原有架构
1. **类型安全**：全栈 TypeScript，编译时错误检测
2. **开发体验**：HMR 支持，快速迭代
3. **现代工具链**：Vite 提供极快的构建速度
4. **组件化开发**：React 组件化架构，易于维护
5. **更好的打包**：electron-builder 更成熟，支持更多平台
6. **灵活的更新**：electron-updater 提供更多控制选项

### 维护成本
- 配置更简洁（相比手动配置 Webpack）
- 依赖更少（electron-vite 集成了大部分工具）
- 社区支持更好（electron-vite 官方维护）
- 文档完善

## 实施计划

1. 备份现有项目
2. 使用 electron-vite 创建新项目
3. 迁移功能：
   - IPC 通信机制
   - 自动更新逻辑
   - 窗口配置
4. 配置 electron-builder
5. 测试打包和发布流程
6. 验证自动更新功能

## 风险和注意事项

### 潜在风险
- GitHub Releases 发布流程需要重新配置
- 自动更新签名配置（macOS/Windows）
- 现有用户的更新过渡

### 缓解措施
- 保持相同的 appId 确保更新连续性
- 在测试仓库先验证发布流程
- 准备回滚方案

## 总结

本设计提供了一个现代化、类型安全、易于维护的 Electron 应用架构。通过使用 electron-vite + React + TypeScript，我们可以获得卓越的开发体验和生产质量的应用程序。
