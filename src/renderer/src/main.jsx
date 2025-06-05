import './assets/main.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import Sticker from './sticker'

const root = document.getElementById('root')

if (window.location.pathname.includes('sticker')) {
  createRoot(root).render(
    <StrictMode>
      <Sticker />
    </StrictMode>
  )
} else {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>
  )
}
