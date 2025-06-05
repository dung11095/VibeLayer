import React from 'react';
import { createRoot } from 'react-dom/client';
import StickerManager from './components/StickerManager';
import './index.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <StickerManager />
  </React.StrictMode>
);