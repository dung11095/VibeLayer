import { useState } from 'react'
import { GiphyFetch } from '@giphy/js-fetch-api'
import { createApi } from 'unsplash-js'
import * as imglyRemoveBackground from '@imgly/background-removal'

const gf = new GiphyFetch(import.meta.env.VITE_GIPHY_API_KEY || '')
const unsplash = createApi({ accessKey: import.meta.env.VITE_UNSPLASH_ACCESS_KEY || '' })
const TABS = ['Search', 'Imported', 'Layout']

function App() {
  const [tab, setTab] = useState('Search')
  const [search, setSearch] = useState('')
  const [results, setResults] = useState([])
  const [imported, setImported] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(false)
  const [layout, setLayout] = useState({ x: 100, y: 100, width: 200, height: 200 })

  const ipcHandle = () => window.electron.ipcRenderer.send('ping')

  // Search Giphy and Unsplash
  const handleSearch = async () => {
    setLoading(true)
    setResults([])
    // Giphy
    const { data: giphyData } = await gf.search(search, { limit: 5 })
    // Unsplash
    const unsplashRes = await unsplash.search.getPhotos({ query: search, perPage: 5 })
    const giphyResults = giphyData.map(gif => ({
      type: 'gif',
      url: gif.images.original.url,
      thumb: gif.images.fixed_width_small.url
    }))
    const unsplashResults = (unsplashRes.response?.results || []).map(img => ({
      type: 'img',
      url: img.urls.raw,
      thumb: img.urls.thumb
    }))
    setResults([...giphyResults, ...unsplashResults])
    setLoading(false)
  }

  // Import and remove background
  const handleImport = async (item) => {
    setLoading(true)
    try {
      const response = await fetch(item.url)
      const blob = await response.blob()
      const file = new File([blob], 'imported.' + (item.type === 'gif' ? 'gif' : 'png'))
      const result = await imglyRemoveBackground.default(file)
      const url = URL.createObjectURL(result)
      setImported(prev => [...prev, { ...item, processedUrl: url }])
    } catch (e) {
      alert('Background removal failed!')
    }
    setLoading(false)
  }

  // Layout editor: select sticker, drag/resize, sync with Sticker window
  const handleLayoutChange = (field, value) => {
    const newLayout = { ...layout, [field]: value }
    setLayout(newLayout)
    if (window.electron?.ipcRenderer) {
      window.electron.ipcRenderer.send('update-sticker-layout', newLayout)
    }
  }

  return (
    <div style={{ background: '#18181b', color: '#fff', minHeight: '100vh', padding: 24 }}>
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{ background: tab === t ? '#27272a' : 'transparent', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, cursor: 'pointer' }}>{t}</button>
        ))}
      </div>
      {tab === 'Search' && (
        <div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search for stickers or GIFs..." style={{ width: 300, padding: 8, borderRadius: 8, border: '1px solid #333', background: '#222', color: '#fff' }} />
          <button onClick={handleSearch} style={{ marginLeft: 8, padding: '8px 16px', borderRadius: 8, background: '#27272a', color: '#fff', border: 'none' }}>Search</button>
          {loading && <div style={{ marginTop: 16 }}>Loading...</div>}
          <div style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {results.map((item, i) => (
                <div key={i} style={{ background: '#222', padding: 8, borderRadius: 8 }}>
                  <img src={item.thumb} alt="result" style={{ width: 100, height: 100, borderRadius: 8 }} />
                  <button onClick={() => handleImport(item)} style={{ marginTop: 8, width: '100%', borderRadius: 8, background: '#3b82f6', color: '#fff', border: 'none', padding: 8 }}>Import & Remove BG</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {tab === 'Imported' && (
        <div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {imported.length === 0 && <div>No imported stickers yet.</div>}
            {imported.map((item, i) => (
              <div key={i} style={{ background: '#222', padding: 8, borderRadius: 8 }}>
                <img src={item.processedUrl} alt="imported" style={{ width: 100, height: 100, borderRadius: 8, cursor: 'pointer', border: selected === i ? '2px solid #3b82f6' : 'none' }} onClick={() => setSelected(i)} />
              </div>
            ))}
          </div>
        </div>
      )}
      {tab === 'Layout' && (
        <div>
          {selected === null ? <div>Select a sticker in Imported tab.</div> : (
            <div>
              <img src={imported[selected].processedUrl} alt="layout" style={{ position: 'absolute', left: layout.x, top: layout.y, width: layout.width, height: layout.height, borderRadius: 16, boxShadow: '0 0 16px #0008' }} />
              <div style={{ marginTop: 220 }}>
                <label>X: <input type="number" value={layout.x} onChange={e => handleLayoutChange('x', Number(e.target.value))} /></label>
                <label style={{ marginLeft: 16 }}>Y: <input type="number" value={layout.y} onChange={e => handleLayoutChange('y', Number(e.target.value))} /></label>
                <label style={{ marginLeft: 16 }}>Width: <input type="number" value={layout.width} onChange={e => handleLayoutChange('width', Number(e.target.value))} /></label>
                <label style={{ marginLeft: 16 }}>Height: <input type="number" value={layout.height} onChange={e => handleLayoutChange('height', Number(e.target.value))} /></label>
                <button style={{ marginLeft: 16, padding: '8px 16px', borderRadius: 8, background: '#3b82f6', color: '#fff', border: 'none' }}
                  onClick={() => {
                    if (window.electron?.ipcRenderer) {
                      window.electron.ipcRenderer.send('update-sticker-layout', { ...layout, stickerUrl: imported[selected].processedUrl })
                    }
                  }}>
                  Apply to Sticker Window
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      <p className="tip">
        Please try pressing <code>F12</code> to open the devTool
      </p>
    </div>
  )
}

export default App
