import React from 'react';

export default function StickerOverlay() {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none' }}>
      {/* Render floating stickers here */}
    </div>
  );
}