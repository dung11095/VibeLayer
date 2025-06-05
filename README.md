# VibeLayer - Desktop Sticker Overlay App

A free, open-source desktop application that lets you display aesthetic stickers and GIFs that stay on top of all windows, perfect for streamers and anyone who wants to personalize their desktop experience.

## Features

🎨 **Aesthetic Stickers & GIFs**: Search and add beautiful stickers and GIFs from Giphy  
🖼️ **Auto Background Removal**: Automatically removes backgrounds from images for a clean look  
📌 **Always On Top**: Stickers stay visible over all applications  
🎯 **Click-Through Overlay**: Won't interfere with your work  
📐 **Layout Editor**: Drag, resize, and position stickers with visual feedback  
🔄 **Auto-Launch**: Starts automatically with your system  
🌙 **Dark Theme**: Beautiful dark UI that's easy on the eyes  
⌨️ **Global Shortcuts**: Quick access with Ctrl+Shift+V  

## Screenshots

### Control Panel
- **Search & Import Tab**: Search Giphy for GIFs, upload local images, or browse files
- **Manage Stickers Tab**: Toggle visibility, adjust size, and delete stickers
- **Layout Editor**: Preview and arrange stickers with drag-and-drop

### Overlay Window
- Transparent, always-on-top display
- Interactive layout mode for positioning
- Non-intrusive click-through functionality

## Installation & Setup

### Prerequisites
- Node.js 16+ and npm
- Git

### Quick Start

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd vibelayer
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

This will start both Vite dev server and Electron app automatically.

### Building for Production

1. **Build the app**
```bash
npm run build:electron
```

2. **Create distribution packages**
```bash
npm run dist
```

The built applications will be in the `dist-electron` folder.

## Usage

### Getting Started
1. Launch VibeLayer
2. The overlay window appears transparently on your screen
3. Double-click anywhere on the overlay or press `Ctrl+Shift+V` to open the control panel

### Adding Stickers
1. **From Giphy**: 
   - Go to "Search & Import" tab
   - Enter search terms (e.g., "cat", "dance", "aesthetic")
   - Click on any GIF to add it to your overlay

2. **From Local Files**:
   - Click "Upload Image" to select from file dialog
   - Or click "Browse Local Files" for system file browser
   - Supported formats: JPG, PNG, GIF, WebP

3. **Background Removal**: All images automatically get background removed for aesthetic transparency

### Managing Stickers
- **Toggle Visibility**: Check/uncheck stickers in the "Manage Stickers" tab
- **Resize**: Use the size slider to adjust sticker dimensions
- **Delete**: Remove unwanted stickers permanently

### Layout Editor
1. Switch to "Layout Editor" tab
2. Click "Enable Layout Mode"
3. Now you can drag stickers directly on your screen
4. Resize using corner handles
5. Click "Disable Layout Mode" when done

### Keyboard Shortcuts
- `Ctrl+Shift+V`: Toggle control panel visibility
- `Double-click overlay`: Open control panel

## Technical Details

### Architecture
- **Frontend**: React 19 + Vite
- **Desktop**: Electron 36
- **Background Removal**: @imgly/background-removal
- **Auto-launch**: auto-launch package
- **API**: Giphy API for GIF search

### File Structure
```
vibelayer/
├── electron/
│   ├── main.cjs          # Main Electron process
│   └── preload.js        # Secure IPC bridge
├── src/
│   ├── components/
│   │   ├── StickerManager.jsx    # Control panel UI
│   │   └── StickerOverlay.jsx    # Overlay display
│   ├── control.jsx       # Control window entry
│   ├── overlay.jsx       # Overlay window entry
│   └── index.css         # Dark theme styles
├── public/
│   ├── control.html      # Control window HTML
│   └── overlay.html      # Overlay window HTML
└── package.json
```

### Key Features Implementation

**Always On Top**: The overlay window uses `alwaysOnTop: true` and `setVisibleOnAllWorkspaces(true)`

**Click-Through**: `setIgnoreMouseEvents(true)` makes the overlay non-interactive by default

**Background Removal**: Uses AI-powered background removal with medium quality model for balance of speed and accuracy

**Auto-Launch**: Automatically registers with system startup using the `auto-launch` package

**Global Shortcuts**: Electron's `globalShortcut` API for system-wide hotkeys

## Configuration

### Giphy API
The app uses a public demo API key. For production use, get your own key from [Giphy Developers](https://developers.giphy.com/) and replace it in `StickerManager.jsx`:

```javascript
const GIPHY_API_KEY = 'your-api-key-here';
```

### Auto-Launch
Auto-launch is enabled by default. To disable:
```javascript
// In electron/main.cjs
// autoLauncher.enable(); // Comment this out
```

### Window Settings
Modify window properties in `electron/main.cjs`:
- Overlay size: Change `width` and `height`
- Control panel size: Adjust `controlWindow` dimensions
- Transparency: Toggle `transparent: true`

## Development

### Development Mode
```bash
npm run dev
```
Runs Vite dev server on http://localhost:5173 and launches Electron

### Building
```bash
npm run build        # Build web assets
npm run build:electron  # Build Electron app
npm run dist        # Create distribution packages
```

### Debugging
- Use Chrome DevTools in Electron windows
- Console logs appear in terminal for main process
- Renderer process logs in DevTools

## Troubleshooting

### Common Issues

**App won't start**:
- Ensure Node.js 16+ is installed
- Delete `node_modules` and run `npm install`
- Check for port 5173 conflicts

**Stickers not showing**:
- Check if overlay window is behind other windows
- Verify stickers are marked as visible
- Try toggling layout mode

**Background removal slow**:
- Large images take more time to process
- Consider resizing images before upload
- The "medium" model balances speed vs quality

**Auto-launch not working**:
- Run app as administrator once on Windows
- Check system startup permissions on macOS/Linux

### Performance Tips
- Limit number of active stickers (recommended: <10)
- Use smaller image sizes when possible
- Close control panel when not needed
- Restart app if it becomes sluggish

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- [Giphy](https://giphy.com) for the GIF API
- [@imgly/background-removal](https://github.com/imgly/background-removal-js) for AI background removal
- [Electron](https://electronjs.org) for cross-platform desktop apps
- [React](https://reactjs.org) and [Vite](https://vitejs.dev) for the modern web stack

---

**Enjoy your aesthetic desktop experience with VibeLayer! 🎨✨**