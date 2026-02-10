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
