const { app, BrowserWindow } = require('electron');
const path = require('path');

let overlayWindow;
let controlWindow;

app.whenReady().then(() => {
  overlayWindow = new BrowserWindow({
    width: 800,
    height: 600,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    hasShadow: false,
    resizable: false,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  overlayWindow.setIgnoreMouseEvents(true);
  overlayWindow.loadURL('http://localhost:5173/overlay');

  controlWindow = new BrowserWindow({
    width: 500,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  controlWindow.loadURL('http://localhost:5173/control');
});