import { useEffect, useState } from 'react'

function Sticker() {
  const [layout, setLayout] = useState(null)
  const [stickerUrl, setStickerUrl] = useState(null)

  useEffect(() => {
    console.log('Checking window.electron?.ipcRenderer:', window.electron?.ipcRenderer);

    if (window.electron?.ipcRenderer) {
      console.log('ipcRenderer found, attempting to attach listener');
      const handler = (_, newLayout) => {
        console.log('Sticker window received layout update:', newLayout);
        setLayout(newLayout);
        if (newLayout && newLayout.stickerUrl) {
          console.log('Sticker window updating stickerUrl:', newLayout.stickerUrl);
          setStickerUrl(newLayout.stickerUrl);
        } else {
          console.log('Sticker window clearing stickerUrl');
          setStickerUrl(null);
        }
      };

      window.electron.ipcRenderer.on('update-sticker-layout', handler);
      console.log('Listener attached for update-sticker-layout');

      return () => {
        if (window.electron?.ipcRenderer) {
          window.electron.ipcRenderer.removeListener('update-sticker-layout', handler);
          console.log('Sticker window listener cleaned up');
        }
      };
    } else {
      console.error('ipcRenderer not available in Sticker window!');
    }
  }, []);

  console.log('Sticker component rendered. Current layout:', layout, 'stickerUrl:', stickerUrl);

  if (!layout || !stickerUrl) return null

  return (
    <div id="sticker-container" style={{ width: '100%', height: '100%', pointerEvents: 'none', position: 'fixed' }}>
      <img id="sticker-image" src={stickerUrl} alt="Sticker" style={{ position: 'absolute', left: layout.x, top: layout.y, width: layout.width, height: layout.height }} />
    </div>
  )
}

export default Sticker 