import React, { useState, useEffect, useRef } from 'react';

export default function StickerOverlay() {
  const [stickers, setStickers] = useState([]);
  const [isLayoutMode, setIsLayoutMode] = useState(false);
  const [dragState, setDragState] = useState({ dragging: false, stickerId: null, offset: { x: 0, y: 0 } });
  const overlayRef = useRef(null);

  useEffect(() => {
    // Load initial stickers
    loadStickers();

    // Listen for sticker updates
    if (window.electronAPI) {
      window.electronAPI.onStickersUpdated((updatedStickers) => {
        setStickers(updatedStickers || []);
      });
    }

    return () => {
      if (window.electronAPI) {
        window.electronAPI.removeAllListeners('stickers-updated');
      }
    };
  }, []);

  const loadStickers = async () => {
    if (window.electronAPI) {
      const savedStickers = await window.electronAPI.getStickers();
      setStickers(savedStickers || []);
    }
  };

  const updateStickerPosition = async (id, newPosition) => {
    const updatedStickers = stickers.map(sticker => 
      sticker.id === id ? { ...sticker, position: newPosition } : sticker
    );
    setStickers(updatedStickers);
    
    if (window.electronAPI) {
      await window.electronAPI.updateStickers(updatedStickers);
    }
  };

  const handleMouseDown = (e, sticker) => {
    if (!isLayoutMode) return;
    
    e.preventDefault();
    const rect = overlayRef.current.getBoundingClientRect();
    const offset = {
      x: e.clientX - sticker.position.x,
      y: e.clientY - sticker.position.y
    };
    
    setDragState({
      dragging: true,
      stickerId: sticker.id,
      offset
    });
  };

  const handleMouseMove = (e) => {
    if (!dragState.dragging || !isLayoutMode) return;
    
    e.preventDefault();
    const newPosition = {
      x: Math.max(0, Math.min(window.innerWidth - 100, e.clientX - dragState.offset.x)),
      y: Math.max(0, Math.min(window.innerHeight - 100, e.clientY - dragState.offset.y))
    };
    
    updateStickerPosition(dragState.stickerId, newPosition);
  };

  const handleMouseUp = () => {
    setDragState({ dragging: false, stickerId: null, offset: { x: 0, y: 0 } });
  };

  const handleDoubleClick = () => {
    if (window.electronAPI) {
      window.electronAPI.showControlWindow();
    }
  };

  // Add global mouse event listeners for dragging
  useEffect(() => {
    if (dragState.dragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState.dragging, dragState.offset, dragState.stickerId]);

  // Check if we're in layout mode based on overlay interaction
  useEffect(() => {
    const checkLayoutMode = () => {
      // This is a simple way to detect if overlay is interactive
      // In a real implementation, you might want to use IPC communication
      setIsLayoutMode(true); // Simplified for demo
    };
    
    checkLayoutMode();
  }, []);

  return (
    <div 
      ref={overlayRef}
      className="fixed inset-0 pointer-events-none"
      onDoubleClick={handleDoubleClick}
      style={{ 
        zIndex: 999999,
        pointerEvents: isLayoutMode ? 'auto' : 'none'
      }}
    >
      {/* Layout mode indicator */}
      {isLayoutMode && (
        <div className="fixed top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-lg text-sm z-50 pointer-events-auto">
          Layout Mode Active - Drag stickers to reposition
        </div>
      )}

      {/* Render stickers */}
      {stickers
        .filter(sticker => sticker.visible)
        .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
        .map((sticker) => (
          <div
            key={sticker.id}
            className={`absolute transition-transform ${
              isLayoutMode 
                ? 'cursor-move hover:scale-105 pointer-events-auto' 
                : 'pointer-events-none'
            } ${dragState.stickerId === sticker.id ? 'scale-110 shadow-lg' : ''}`}
            style={{
              left: sticker.position.x,
              top: sticker.position.y,
              width: sticker.size.width,
              height: sticker.size.height,
              zIndex: sticker.zIndex || 1,
              transform: dragState.stickerId === sticker.id ? 'scale(1.1)' : 'scale(1)',
            }}
            onMouseDown={(e) => handleMouseDown(e, sticker)}
          >
            <img
              src={sticker.url}
              alt="Desktop sticker"
              className="w-full h-full object-contain select-none"
              draggable={false}
              style={{
                filter: isLayoutMode ? 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.5))' : 'none',
              }}
            />
            
            {/* Resize handle in layout mode */}
            {isLayoutMode && (
              <div
                className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 rounded-tl-lg cursor-se-resize pointer-events-auto"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  // Implement resize logic here
                }}
              />
            )}
          </div>
        ))}

      {/* Welcome message when no stickers */}
      {stickers.length === 0 && (
        <div 
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center bg-black bg-opacity-50 p-6 rounded-lg pointer-events-auto cursor-pointer"
          onDoubleClick={handleDoubleClick}
        >
          <h2 className="text-xl font-bold mb-2">Welcome to VibeLayer!</h2>
          <p className="text-gray-300 mb-2">Double-click to open the control panel</p>
          <p className="text-sm text-gray-400">Or press Ctrl+Shift+V</p>
        </div>
      )}
    </div>
  );
}