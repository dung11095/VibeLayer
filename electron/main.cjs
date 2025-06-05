const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const AutoLaunch = require('auto-launch');

let overlayWindow;
let controlWindow;
let stickers = [];

// Auto-launch setup
const autoLauncher = new AutoLaunch({
  name: 'VibeLayer',
  path: app.getPath('exe'),
});

// Enable auto-launch
autoLauncher.enable();

function createOverlayWindow() {
  overlayWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    hasShadow: false,
    resizable: false,
    skipTaskbar: true,
    focusable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Make window click-through
  overlayWindow.setIgnoreMouseEvents(true, { forward: true });
  
  if (app.isPackaged) {
    overlayWindow.loadFile(path.join(__dirname, '../dist/overlay.html'));
  } else {
    overlayWindow.loadURL('http://localhost:5173/overlay.html');
  }

  overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  overlayWindow.setFullScreenable(false);
}

function createControlWindow() {
  controlWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#121212',
  });

  if (app.isPackaged) {
    controlWindow.loadFile(path.join(__dirname, '../dist/control.html'));
  } else {
    controlWindow.loadURL('http://localhost:5173/control.html');
  }

  // Hide control window on close, don't quit app
  controlWindow.on('close', (event) => {
    event.preventDefault();
    controlWindow.hide();
  });
}

app.whenReady().then(() => {
  createOverlayWindow();
  createControlWindow();
  
  // Hide control window initially
  controlWindow.hide();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createOverlayWindow();
    createControlWindow();
  }
});

// IPC Handlers
ipcMain.handle('show-control-window', () => {
  controlWindow.show();
  controlWindow.focus();
});

ipcMain.handle('hide-control-window', () => {
  controlWindow.hide();
});

ipcMain.handle('update-stickers', (event, newStickers) => {
  stickers = newStickers;
  if (overlayWindow) {
    overlayWindow.webContents.send('stickers-updated', stickers);
  }
});

ipcMain.handle('get-stickers', () => {
  return stickers;
});

ipcMain.handle('download-image', async (event, imageUrl, filename) => {
  try {
    const response = await fetch(imageUrl);
    const buffer = await response.arrayBuffer();
    
    const userDataPath = app.getPath('userData');
    const stickersDir = path.join(userDataPath, 'stickers');
    
    if (!fs.existsSync(stickersDir)) {
      fs.mkdirSync(stickersDir, { recursive: true });
    }
    
    const filePath = path.join(stickersDir, filename);
    fs.writeFileSync(filePath, Buffer.from(buffer));
    
    return filePath;
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
});

ipcMain.handle('select-local-file', async () => {
  const result = await dialog.showOpenDialog(controlWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'] }
    ]
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

ipcMain.handle('open-external', (event, url) => {
  shell.openExternal(url);
});

ipcMain.handle('toggle-overlay-interaction', (event, interactive) => {
  if (overlayWindow) {
    overlayWindow.setIgnoreMouseEvents(!interactive, { forward: true });
  }
});

// Global shortcut to show/hide control window
const { globalShortcut } = require('electron');

app.whenReady().then(() => {
  globalShortcut.register('CommandOrControl+Shift+V', () => {
    if (controlWindow.isVisible()) {
      controlWindow.hide();
    } else {
      controlWindow.show();
      controlWindow.focus();
    }
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});