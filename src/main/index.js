const { app, shell, BrowserWindow, ipcMain } = require('electron')
const { join } = require('path')
const { electronApp, optimizer, is } = require('@electron-toolkit/utils')
const icon = join(__dirname, '../../resources/icon.png')
const fs = require('fs')
const path = require('path')
const Store = require('electron-store')
const AutoLaunch = require('auto-launch')

function createWindows() {
  // Sticker Window (transparent, always-on-top, click-through)
  const stickerWindow = new BrowserWindow({
    width: 400,
    height: 400,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    hasShadow: false,
    resizable: false,
    skipTaskbar: true,
    focusable: false, // click-through
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      webSecurity: false // allow loading local file URLs
    }
  });
  // Enable click-through
  stickerWindow.setIgnoreMouseEvents(true, { forward: true });

  // Manager Window (normal)
  const managerWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      webSecurity: false // allow loading local file URLs
    }
  });

  managerWindow.on('ready-to-show', () => {
    managerWindow.show();
  });

  // Load URLs
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    stickerWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] + '/sticker.html');
    managerWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] + '/index.html');
  } else {
    stickerWindow.loadFile(join(__dirname, '../renderer/sticker.html'));
    managerWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  // IPC: Forward layout changes from manager to sticker
  ipcMain.on('update-sticker-layout', (_, layout) => {
    console.log('Main received layout update:', layout);
    if (BrowserWindow.getAllWindows().length > 1) {
      const stickerWindow = BrowserWindow.getAllWindows().find(win => {
        const webContents = win.webContents;
        try {
          return win !== managerWindow;
        } catch (e) {
          return false;
        }
      });
      
      if (stickerWindow && !stickerWindow.isDestroyed()) {
        console.log('Main forwarding layout update to sticker window');
        stickerWindow.webContents.send('update-sticker-layout', layout);
      } else {
        console.error('Sticker window not found or destroyed');
      }
    } else {
        console.error('No other windows open to send layout to');
    }
  });

  stickerWindow.webContents.openDevTools(); // Add this temporarily for debugging
}

const stickersDir = path.join(app.getPath('userData'), 'stickers')
if (!fs.existsSync(stickersDir)) fs.mkdirSync(stickersDir)

const appLauncher = new AutoLaunch({ name: 'VibeLayer' })

const store = new (Store.default || Store)()

ipcMain.handle('save-sticker', async (_, { name, buffer }) => {
  const filePath = path.join(stickersDir, name)
  fs.writeFileSync(filePath, Buffer.from(buffer))
  return filePath
})
ipcMain.handle('list-stickers', async () => {
  return fs.readdirSync(stickersDir).map(name => ({
    name,
    path: path.join(stickersDir, name)
  }))
})
ipcMain.handle('delete-sticker', async (_, name) => {
  const filePath = path.join(stickersDir, name)
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
  return true
})
ipcMain.handle('get-layout', () => store.get('layout', {}))
ipcMain.handle('set-layout', (_, layout) => { store.set('layout', layout); return true })
ipcMain.handle('get-settings', () => store.get('settings', {}))
ipcMain.handle('set-settings', (_, settings) => { store.set('settings', settings); return true })
ipcMain.handle('rename-sticker', async (_, { oldName, newName }) => {
  const oldPath = path.join(stickersDir, oldName)
  const newPath = path.join(stickersDir, newName)
  if (fs.existsSync(oldPath)) fs.renameSync(oldPath, newPath)
  return true
})
ipcMain.handle('set-auto-launch', async (_, enable) => {
  if (enable) await appLauncher.enable()
  else await appLauncher.disable()
  return true
})
ipcMain.handle('get-auto-launch', async () => appLauncher.isEnabled())

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindows()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindows()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

