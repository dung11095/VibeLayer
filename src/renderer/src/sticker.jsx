import { useEffect, useState } from 'react'

function Sticker() {
  const [layout, setLayout] = useState()
  const [stickerUrl, setStickerUrl] = useState(null)

  useEffect(() => {
    if (window.electron?.ipcRenderer) {
      window.electron.ipcRenderer.on('update-sticker-layout', (_, newLayout) => {
        setLayout(newLayout)
        if (newLayout && newLayout.stickerUrl) setStickerUrl(newLayout.stickerUrl)
      })
    }
  }, [])

  if (!layout || !stickerUrl) return null

  return (
    <div style={{ width: '100%', height: '100%', pointerEvents: 'none', position: 'relative' }}>
      <img src={stickerUrl} alt="Sticker" style={{ position: 'absolute', left: layout.x, top: layout.y, width: layout.width, height: layout.height, borderRadius: 16, boxShadow: '0 0 16px #0008' }} />
    </div>
  )
}

export default Sticker 