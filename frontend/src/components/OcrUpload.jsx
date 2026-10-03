import React, { useState, useRef } from 'react';
import { Image as ImageIcon, Cpu, Cloud } from 'lucide-react';
import { Button } from './ui/Button';
import { ocrService } from '../services/api';
import { extractTextFromImage } from '../engine/ocrEngine';

export const OcrUpload = ({ onEquationExtracted }) => {
  const [isHovering, setIsHovering] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [statusText, setStatusText] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError('');
    setIsUploading(true);

    // Strategy: Try local OCR first, fall back to cloud API
    try {
      // Step 1: Try Tesseract.js (local, free, unlimited)
      setStatusText('Extracting text locally...');
      const localResult = await extractTextFromImage(file);

      if (localResult.success && localResult.text && localResult.confidence > 40) {
        onEquationExtracted(localResult.text);
        setStatusText('');
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      // Step 2: Fall back to cloud API if local OCR had low confidence
      setStatusText('Trying AI extraction...');
      const formData = new FormData();
      formData.append('image', file);

      const data = await ocrService.uploadImage(formData);
      if (data.extractedText) {
        onEquationExtracted(data.extractedText);
      } else {
        setError('Could not extract math from this image. Try a clearer photo.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to extract math from image.');
    } finally {
      setIsUploading(false);
      setStatusText('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="relative group inline-block">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
      <Button
        variant="secondary"
        onClick={() => { setError(''); fileInputRef.current?.click(); }}
        isLoading={isUploading}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className="gap-2 shrink-0 rounded-xl"
        title="Extract Math from Image"
      >
        <ImageIcon size={18} className={isHovering ? "text-indigo-400" : "text-gray-400"} />
        <span className="hidden sm:inline">{statusText || 'Upload Image'}</span>
      </Button>

      {error && (
        <div className="absolute top-full left-0 mt-2 w-64 z-50 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl p-3 backdrop-blur-xl shadow-xl animate-in fade-in slide-in-from-top-2 duration-300">
          {error}
          <button
            onClick={() => setError('')}
            className="ml-2 text-red-300 hover:text-white font-bold"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
