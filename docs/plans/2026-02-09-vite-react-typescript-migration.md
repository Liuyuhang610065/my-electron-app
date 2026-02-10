# Electron + Vite + React + TypeScript Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate existing Electron app from vanilla HTML/JS to electron-vite + React + TypeScript stack.

**Architecture:** Complete rebuild using electron-vite template with three-process architecture (main/preload/renderer). Maintain IPC communication and auto-update functionality while migrating to electron-builder.

**Tech Stack:** Electron 40, electron-vite 2.0, React 18, TypeScript 5, electron-builder 24, electron-updater 6

---

## Task 1: Initialize electron-vite Project

**Files:**
- Create: `package.json`
- Create: `.npmrc`

**Step 1: Remove existing node_modules and package files**

```bash
rm -rf node_modules package-lock.json
```

**Step 2: Initialize new package.json with electron-vite dependencies**

Create `package.json`:

```json
{
  "name": "my-electron-app",
  "version": "1.0.0",
  "description": "Electron app with Vite, React, and TypeScript",
  "main": "out/main/index.js",
  "author": "Liu yuhang",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/Liuyuhang610065/my-electron-app"
  },
  "scripts": {
    "dev": "electron-vite dev",
    "build": "electron-vite build",
    "preview": "electron-vite preview",
    "package": "electron-builder",
    "publish": "electron-builder --publish always"
  },
  "dependencies": {
    "electron-updater": "^6.1.7"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "@vitejs/plugin-react": "^4.2.1",
    "electron": "^40.2.1",
    "electron-builder": "^24.9.1",
    "electron-vite": "^2.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.3.3",
    "vite": "^5.0.11"
  }
}
```

**Step 3: Install dependencies**

Run: `npm install`
Expected: All dependencies installed successfully

**Step 4: Verify installation**

Run: `npx electron-vite --version`
Expected: Output version number (e.g., "2.0.0")

**Step 5: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: initialize electron-vite project with dependencies

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 2: Create TypeScript Configuration

**Files:**
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `tsconfig.web.json`

**Step 1: Create base TypeScript config**

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

**Step 2: Create Node environment config**

Create `tsconfig.node.json`:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "composite": true,
    "types": ["node"]
  },
  "include": ["src/main/**/*", "src/preload/**/*", "electron.vite.config.ts"]
}
```

**Step 3: Create Web environment config**

Create `tsconfig.web.json`:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "composite": true,
    "jsx": "react-jsx",
    "lib": ["ES2020", "DOM", "DOM.Iterable"]
  },
  "include": ["src/renderer/**/*"]
}
```

**Step 4: Verify TypeScript configs**

Run: `npx tsc --showConfig -p tsconfig.node.json`
Expected: Shows merged configuration without errors

**Step 5: Commit**

```bash
git add tsconfig.json tsconfig.node.json tsconfig.web.json
git commit -m "chore: configure TypeScript for main/preload/renderer

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 3: Configure electron-vite Build

**Files:**
- Create: `electron.vite.config.ts`

**Step 1: Create electron-vite configuration**

Create `electron.vite.config.ts`:

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
    root: 'src/renderer',
    resolve: {
      alias: {
        '@renderer': resolve(__dirname, 'src/renderer/src')
      }
    },
    plugins: [react()],
    build: {
      rollupOptions: {
        input: resolve(__dirname, 'src/renderer/index.html')
      }
    }
  }
})
```

**Step 2: Verify config loads without errors**

Run: `npx electron-vite build --help`
Expected: Shows help output without config errors

**Step 3: Commit**

```bash
git add electron.vite.config.ts
git commit -m "chore: configure electron-vite for three-process build

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 4: Configure electron-builder

**Files:**
- Create: `electron-builder.yml`

**Step 1: Create electron-builder configuration**

Create `electron-builder.yml`:

```yaml
appId: com.liuyuhang.myelectronapp
productName: my-electron-app
directories:
  output: out
  buildResources: resources
files:
  - out/main
  - out/preload
  - out/renderer
  - package.json
asarUnpack:
  - resources/**
publish:
  provider: github
  owner: Liuyuhang610065
  repo: my-electron-app
mac:
  category: public.app-category.utilities
  target:
    - dmg
    - zip
win:
  target:
    - nsis
    - zip
linux:
  target:
    - AppImage
    - deb
```

**Step 2: Create resources directory**

Run: `mkdir -p resources`
Expected: Directory created

**Step 3: Commit**

```bash
git add electron-builder.yml
git commit -m "chore: configure electron-builder for packaging

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 5: Create Project Structure

**Files:**
- Create: `src/main/.gitkeep`
- Create: `src/preload/.gitkeep`
- Create: `src/renderer/src/.gitkeep`

**Step 1: Create source directories**

```bash
mkdir -p src/main src/preload src/renderer/src
```

**Step 2: Add gitkeep files**

```bash
touch src/main/.gitkeep src/preload/.gitkeep src/renderer/src/.gitkeep
```

**Step 3: Verify structure**

Run: `tree src -L 3`
Expected: Shows three-level directory structure

**Step 4: Commit**

```bash
git add src/
git commit -m "chore: create three-process directory structure

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 6: Implement Preload Script with Type Definitions

**Files:**
- Create: `src/preload/index.ts`
- Create: `src/preload/index.d.ts`

**Step 1: Create type definitions for IPC API**

Create `src/preload/index.d.ts`:

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

**Step 2: Implement preload script**

Create `src/preload/index.ts`:

```typescript
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
```

**Step 3: Verify TypeScript compiles**

Run: `npx tsc -p tsconfig.node.json --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add src/preload/
git commit -m "feat: implement type-safe preload script with IPC API

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 7: Implement Main Process

**Files:**
- Create: `src/main/index.ts`
- Remove: `main.js` (old file)

**Step 1: Implement main process entry point**

Create `src/main/index.ts`:

```typescript
import { app, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  // Register IPC handlers
  ipcMain.handle('ping', () => {
    console.log('Received ping from renderer')
    return 'pong'
  })

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
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc -p tsconfig.node.json --noEmit`
Expected: No errors

**Step 3: Remove old main.js**

Run: `git rm main.js`
Expected: File removed

**Step 4: Commit**

```bash
git add src/main/index.ts
git commit -m "feat: implement main process with IPC handler

- Migrate from main.js to TypeScript
- Add development mode detection
- Configure secure web preferences

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 8: Implement Auto-Update Module

**Files:**
- Create: `src/main/update.ts`
- Modify: `src/main/index.ts`

**Step 1: Create auto-update module**

Create `src/main/update.ts`:

```typescript
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
```

**Step 2: Import and call setupAutoUpdater in main process**

Modify `src/main/index.ts`, add import at top:

```typescript
import { setupAutoUpdater } from './update'
```

Modify the `app.whenReady()` section:

```typescript
app.whenReady().then(() => {
  // Setup auto-update
  setupAutoUpdater()

  // Register IPC handlers
  ipcMain.handle('ping', () => {
    console.log('Received ping from renderer')
    return 'pong'
  })

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})
```

**Step 3: Verify TypeScript compiles**

Run: `npx tsc -p tsconfig.node.json --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add src/main/update.ts src/main/index.ts
git commit -m "feat: implement auto-update with electron-updater

- Check for updates on startup and hourly
- Auto-install downloaded updates
- Disabled in development mode

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 9: Create React Renderer HTML

**Files:**
- Create: `src/renderer/index.html`
- Remove: `index.html` (old file)

**Step 1: Create renderer HTML template**

Create `src/renderer/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta
      http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'"
    />
    <title>My Electron App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./src/main.tsx"></script>
  </body>
</html>
```

**Step 2: Remove old index.html**

Run: `git rm index.html`
Expected: File removed

**Step 3: Commit**

```bash
git add src/renderer/index.html
git commit -m "feat: create React renderer HTML template

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 10: Implement React Application

**Files:**
- Create: `src/renderer/src/main.tsx`
- Create: `src/renderer/src/App.tsx`
- Create: `src/renderer/src/App.css`
- Remove: `renderer.js` (old file)

**Step 1: Create React entry point**

Create `src/renderer/src/main.tsx`:

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

const root = document.getElementById('root')

if (!root) {
  throw new Error('Root element not found')
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

**Step 2: Create App component**

Create `src/renderer/src/App.tsx`:

```typescript
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
```

**Step 3: Create basic styles**

Create `src/renderer/src/App.css`:

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #282c34;
  color: #ffffff;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
}

.app-header {
  text-align: center;
  margin-bottom: 2rem;
}

.app-header h1 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.app-header p {
  font-size: 3rem;
}

.app-content {
  max-width: 600px;
  width: 100%;
}

.version-info,
.ipc-demo {
  background-color: #3a3f4b;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.version-info h2,
.ipc-demo h2 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: #61dafb;
}

.version-info ul {
  list-style: none;
}

.version-info li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #4a4f5b;
}

.version-info li:last-child {
  border-bottom: none;
}

.ipc-demo code {
  background-color: #282c34;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  color: #61dafb;
}
```

**Step 4: Remove old renderer.js**

Run: `git rm renderer.js`
Expected: File removed

**Step 5: Verify TypeScript compiles**

Run: `npx tsc -p tsconfig.web.json --noEmit`
Expected: No errors

**Step 6: Commit**

```bash
git add src/renderer/src/
git commit -m "feat: implement React application with IPC demo

- Create React entry point with StrictMode
- Build App component displaying version info and IPC test
- Add basic styling

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 11: Remove Old Files

**Files:**
- Remove: `preload.js`
- Remove: `forge.config.js`

**Step 1: Remove old preload.js**

Run: `git rm preload.js`
Expected: File removed

**Step 2: Remove Electron Forge config**

Run: `git rm forge.config.js`
Expected: File removed

**Step 3: Commit**

```bash
git commit -m "chore: remove old Electron Forge files

Cleaned up legacy files from pre-migration:
- preload.js (replaced by src/preload/index.ts)
- forge.config.js (replaced by electron-builder.yml)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 12: Test Development Build

**Files:**
- None (testing only)

**Step 1: Build the application**

Run: `npm run build`
Expected: Build completes successfully, creates `out/` directory

**Step 2: Verify build output structure**

Run: `ls -la out/`
Expected: Shows `main/`, `preload/`, and `renderer/` directories

**Step 3: Check main process bundle**

Run: `ls out/main/`
Expected: Shows `index.js` file

**Step 4: Check renderer process bundle**

Run: `ls out/renderer/`
Expected: Shows `index.html` and asset files

**Step 5: Test that types are correct**

Run: `npx tsc -p tsconfig.node.json --noEmit && npx tsc -p tsconfig.web.json --noEmit`
Expected: No type errors

---

## Task 13: Manual Testing in Development Mode

**Files:**
- None (testing only)

**Step 1: Start development server**

Run: `npm run dev`
Expected: Electron app launches with dev tools open

**Step 2: Verify UI renders**

Manual check:
- Window shows "Hello from Electron + React + TypeScript!"
- Version information displays correctly
- IPC ping response shows "pong"

**Step 3: Test hot reload**

Edit `src/renderer/src/App.tsx`, change the greeting text
Expected: UI updates automatically without restart

**Step 4: Test main process restart**

Edit `src/main/index.ts`, change window width from 800 to 900
Expected: Electron restarts automatically

**Step 5: Stop development server**

Run: Press `Ctrl+C` in terminal
Expected: Server stops cleanly

---

## Task 14: Update README Documentation

**Files:**
- Modify: `README.md` (if exists) or Create: `README.md`

**Step 1: Create or update README**

Create/Update `README.md`:

```markdown
# My Electron App

A modern Electron application built with Vite, React, and TypeScript.

## Tech Stack

- **Electron** 40 - Desktop application framework
- **Vite** 5 - Fast build tool and dev server
- **React** 18 - UI framework
- **TypeScript** 5 - Type-safe JavaScript
- **electron-builder** - Application packaging
- **electron-updater** - Automatic updates from GitHub Releases

## Project Structure

```
src/
├── main/          # Main process (Node.js)
│   ├── index.ts   # Application entry point
│   └── update.ts  # Auto-update logic
├── preload/       # Preload scripts (Bridge)
│   ├── index.ts   # IPC API implementation
│   └── index.d.ts # TypeScript definitions
└── renderer/      # Renderer process (Browser)
    ├── index.html # HTML template
    └── src/
        ├── main.tsx # React entry point
        ├── App.tsx  # Root component
        └── App.css  # Styles
```

## Development

```bash
# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Building & Distribution

```bash
# Package the application
npm run package

# Build and publish to GitHub Releases
npm run publish
```

The app will automatically check for updates from GitHub Releases every hour.

## IPC Communication

The app uses type-safe IPC communication between processes:

- `electronAPI.ping()` - Test IPC communication
- `electronAPI.getVersions()` - Get Electron/Node/Chrome versions

See `src/preload/index.d.ts` for the full API.

## License

MIT
```

**Step 2: Commit**

```bash
git add README.md
git commit -m "docs: update README with new tech stack and instructions

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 15: Final Verification and Production Build

**Files:**
- None (testing only)

**Step 1: Clean previous builds**

Run: `rm -rf out/`
Expected: Output directory removed

**Step 2: Run production build**

Run: `npm run build`
Expected: Build completes without errors

**Step 3: Verify all TypeScript compiles**

Run: `npx tsc -p tsconfig.node.json --noEmit && npx tsc -p tsconfig.web.json --noEmit`
Expected: No type errors

**Step 4: Test preview mode**

Run: `npm run preview`
Expected: Electron app launches in production mode (no dev tools)

**Step 5: Verify all features work**

Manual verification:
- ✓ Window opens correctly
- ✓ UI renders properly
- ✓ Version info displays
- ✓ IPC ping/pong works
- ✓ No console errors

---

## Task 16: Final Commit and Branch Merge Preparation

**Files:**
- None (git operations only)

**Step 1: Check git status**

Run: `git status`
Expected: Working tree clean (all changes committed)

**Step 2: View commit history**

Run: `git log --oneline`
Expected: Shows all commits from this migration

**Step 3: Push feature branch to remote**

Run: `git push -u origin feature/vite-react-typescript`
Expected: Branch pushed successfully

**Step 4: Create summary of changes**

Document in terminal output:
- ✓ Migrated from vanilla JS to TypeScript
- ✓ Integrated React with Vite for fast development
- ✓ Maintained IPC communication functionality
- ✓ Migrated auto-update from update-electron-app to electron-updater
- ✓ Migrated packaging from Electron Forge to electron-builder
- ✓ Removed 4 old files (main.js, renderer.js, preload.js, forge.config.js)
- ✓ Added comprehensive type safety across all processes

---

## Testing Strategy

This migration focuses on:
1. **Build verification** - Ensure TypeScript compiles without errors
2. **Manual testing** - Verify UI and IPC functionality work correctly
3. **Development workflow** - Confirm hot reload works for both processes

Note: Automated tests can be added in a follow-up task using Vitest or Jest.

## Rollback Plan

If issues occur:
1. Switch back to `main` branch: `git checkout main`
2. Old codebase remains intact
3. Worktree can be removed: `git worktree remove .worktrees/vite-react-typescript`

## Next Steps After Migration

1. Test packaging: `npm run package` to create distributable
2. Test auto-update mechanism with a test release
3. Consider adding:
   - Unit tests with Vitest
   - E2E tests with Playwright
   - ESLint and Prettier for code quality
   - CI/CD pipeline with GitHub Actions
