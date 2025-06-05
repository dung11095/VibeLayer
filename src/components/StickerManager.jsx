import React, { useState, useEffect } from 'react';
import { removeBackgroundFromImageFile } from '@imgly/background-removal';

const GIPHY_API_KEY = process.env.REACT_APP_GIPHY_API_KEY;

export default function StickerManager() {
  const [activeTab, setActiveTab] = useState('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [stickers, setStickers] = useState([]);
  const [selectedSticker, setSelectedSticker] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStickers();
    
    // Listen for sticker updates from overlay
    if (window.electronAPI) {
      window.electronAPI.onStickersUpdated((updatedStickers) => {
        setStickers(updatedStickers);
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

  const searchGifs = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(searchQuery)}&limit=20&rating=g`
      );
      const data = await response.json();
      setSearchResults(data.data || []);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    }
    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchGifs();
    }
  };

  const processImage = async (imageFile, originalUrl = null) => {
    setIsProcessing(true);
    try {
      const result = await removeBackgroundFromImageFile({
        imageFile: imageFile,
        model: 'medium'
      });
      
      const processedBlob = result.image;
      const processedUrl = URL.createObjectURL(processedBlob);
      
      const newSticker = {
        id: Date.now() + Math.random(),
        url: processedUrl,
        originalUrl: originalUrl,
        position: { x: 100, y: 100 },
        size: { width: 150, height: 150 },
        visible: true,
        zIndex: stickers.length + 1
      };
      
      const updatedStickers = [...stickers, newSticker];
      setStickers(updatedStickers);
      
      if (window.electronAPI) {
        await window.electronAPI.updateStickers(updatedStickers);
      }
      
    } catch (error) {
      console.error('Background removal failed:', error);
      alert('Failed to process image. Please try again.');
    }
    setIsProcessing(false);
  };

  const handleGifSelect = async (gif) => {
    try {
      const response = await fetch(gif.images.original.url);
      const blob = await response.blob();
      const file = new File([blob], `gif-${gif.id}.gif`, { type: blob.type });
      await processImage(file, gif.images.original.url);
    } catch (error) {
      console.error('Failed to process GIF:', error);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await processImage(file);
    }
  };

  const handleLocalFileSelect = async () => {
    if (window.electronAPI) {
      const filePath = await window.electronAPI.selectLocalFile();
      if (filePath) {
        try {
          const file = new File([], filePath);
          await processImage(file);
        } catch (error) {
          console.error('Failed to load local file:', error);
        }
      }
    }
  };

  const updateStickerProperty = async (id, property, value) => {
    const updatedStickers = stickers.map(sticker => 
      sticker.id === id ? { ...sticker, [property]: value } : sticker
    );
    setStickers(updatedStickers);
    
    if (window.electronAPI) {
      await window.electronAPI.updateStickers(updatedStickers);
    }
  };

  const deleteSticker = async (id) => {
    const updatedStickers = stickers.filter(sticker => sticker.id !== id);
    setStickers(updatedStickers);
    
    if (window.electronAPI) {
      await window.electronAPI.updateStickers(updatedStickers);
    }
  };

  const enableLayoutMode = () => {
    if (window.electronAPI) {
      window.electronAPI.toggleOverlayInteraction(true);
    }
    setActiveTab('layout');
  };

  const disableLayoutMode = () => {
    if (window.electronAPI) {
      window.electronAPI.toggleOverlayInteraction(false);
    }
  };

  return (
    <div className="h-full bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold mb-4">VibeLayer - Desktop Stickers</h1>
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('search')}
            className={`px-4 py-2 rounded-t-lg transition-colors ${
              activeTab === 'search' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Search & Import
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`px-4 py-2 rounded-t-lg transition-colors ${
              activeTab === 'manage' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Manage Stickers
          </button>
          <button
            onClick={() => setActiveTab('layout')}
            className={`px-4 py-2 rounded-t-lg transition-colors ${
              activeTab === 'layout' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Layout Editor
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'search' && (
          <div className="p-4">
            <div className="mb-6">
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Search for GIFs and stickers..."
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                />
                <button
                  onClick={searchGifs}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 rounded-lg transition-colors"
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
              
              <div className="flex gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg cursor-pointer transition-colors"
                >
                  Upload Image
                </label>
                <button
                  onClick={handleLocalFileSelect}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                >
                  Browse Local Files
                </button>
              </div>
            </div>

            {isProcessing && (
              <div className="mb-4 p-4 bg-yellow-900 border border-yellow-600 rounded-lg">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400 mr-2"></div>
                  Processing image and removing background...
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {searchResults.map((gif) => (
                <div
                  key={gif.id}
                  className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:bg-gray-700 transition-colors"
                  onClick={() => handleGifSelect(gif)}
                >
                  <img
                    src={gif.images.fixed_height_small.url}
                    alt={gif.title}
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-2">
                    <p className="text-sm text-gray-300 truncate">{gif.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'manage' && (
          <div className="p-4">
            <div className="grid gap-4">
              {stickers.map((sticker) => (
                <div key={sticker.id} className="bg-gray-800 rounded-lg p-4 flex items-center space-x-4">
                  <img
                    src={sticker.url}
                    alt="Sticker"
                    className="w-16 h-16 object-contain bg-checkered rounded"
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={sticker.visible}
                          onChange={(e) => updateStickerProperty(sticker.id, 'visible', e.target.checked)}
                          className="rounded"
                        />
                        <span>Visible</span>
                      </label>
                      <div className="flex items-center space-x-2">
                        <span>Size:</span>
                        <input
                          type="range"
                          min="50"
                          max="300"
                          value={sticker.size.width}
                          onChange={(e) => {
                            const size = parseInt(e.target.value);
                            updateStickerProperty(sticker.id, 'size', { width: size, height: size });
                          }}
                          className="w-20"
                        />
                        <span className="text-sm text-gray-400">{sticker.size.width}px</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span>Position: ({sticker.position.x}, {sticker.position.y})</span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteSticker(sticker.id)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
                  >
                    Delete
                  </button>
                </div>
              ))}
              {stickers.length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  No stickers yet. Add some from the Search & Import tab!
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'layout' && (
          <div className="p-4">
            <div className="mb-4 p-4 bg-blue-900 border border-blue-600 rounded-lg">
              <h3 className="font-bold mb-2">Layout Editor Mode</h3>
              <p className="text-sm text-blue-200 mb-3">
                In this mode, you can drag and resize stickers directly on your screen. 
                The overlay becomes interactive temporarily.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={enableLayoutMode}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded transition-colors"
                >
                  Enable Layout Mode
                </button>
                <button
                  onClick={disableLayoutMode}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded transition-colors"
                >
                  Disable Layout Mode
                </button>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="font-bold mb-3">Screen Preview</h4>
              <div className="relative bg-gray-900 rounded border-2 border-gray-600 aspect-video overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 opacity-50"></div>
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                  Screen Preview - Stickers will appear here
                </div>
                {stickers.filter(s => s.visible).map((sticker) => (
                  <div
                    key={sticker.id}
                    className="absolute"
                    style={{
                      left: `${(sticker.position.x / 1920) * 100}%`,
                      top: `${(sticker.position.y / 1080) * 100}%`,
                      width: `${(sticker.size.width / 1920) * 100}%`,
                      height: `${(sticker.size.height / 1080) * 100}%`,
                      zIndex: sticker.zIndex
                    }}
                  >
                    <img
                      src={sticker.url}
                      alt="Sticker preview"
                      className="w-full h-full object-contain"
                      draggable={false}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}