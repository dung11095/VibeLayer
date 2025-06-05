import React from 'react';
import { createRoot } from 'react-dom/client';
import StickerOverlay from './components/StickerOverlay';
import './index.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <StickerOverlay />
  </React.StrictMode>
);