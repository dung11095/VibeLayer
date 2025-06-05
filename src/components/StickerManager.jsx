import React, { useState } from 'react';
import { removeBackgroundFromImageFile } from '@imgly/background-removal';
import '../index.css';

export default function StickerManager() {
  const [image, setImage] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    const result = await removeBackgroundFromImageFile({
      imageFile: file,
      model: 'medium'
    });
    const url = URL.createObjectURL(result.image);
    setImage(url);
    // Send to overlay via IPC or shared state
  };

  return (
    <div className="p-4 bg-gray-900 text-white h-full">
      <h1 className="text-xl mb-4">Sticker Manager</h1>
      <input type="file" accept="image/*" onChange={handleFileChange} className="mb-4" />
      {image && <img src={image} alt="Processed" className="max-w-full h-auto" />}
    </div>
  );
}