const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Window management
  showControlWindow: () => ipcRenderer.invoke('show-control-window'),
  hideControlWindow: () => ipcRenderer.invoke('hide-control-window'),
  
  // Sticker management
  updateStickers: (stickers) => ipcRenderer.invoke('update-stickers', stickers),
  getStickers: () => ipcRenderer.invoke('get-stickers'),
  
  // File operations
  downloadImage: (url, filename) => ipcRenderer.invoke('download-image', url, filename),
  selectLocalFile: () => ipcRenderer.invoke('select-local-file'),
  
  // External operations
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  
  // Overlay interaction
  toggleOverlayInteraction: (interactive) => ipcRenderer.invoke('toggle-overlay-interaction', interactive),
  
  // Event listeners
  onStickersUpdated: (callback) => {
    ipcRenderer.on('stickers-updated', (event, stickers) => callback(stickers));
  },
  
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  }
});