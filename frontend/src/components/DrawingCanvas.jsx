import React, { useRef, useState, useEffect } from 'react';
import { Pencil, Eraser, RotateCcw, Wand2 } from 'lucide-react';
import { Button } from './ui/Button';
import { extractTextFromImage } from '../engine/ocrEngine';

export const DrawingCanvas = ({ onEquationExtracted }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    // Set canvas resolution to match display size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    // Fill with white background for OCR
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    if (e.touches) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDraw = (e) => {
    e.preventDefault();
    const ctx = canvasRef.current.getContext('2d');
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext('2d');
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDraw = (e) => {
    e?.preventDefault();
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);
    setHasDrawn(false);
  };

  const recognize = async () => {
    if (!hasDrawn) return;
    setIsRecognizing(true);

    try {
      const canvas = canvasRef.current;
      // Convert canvas to blob
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      const file = new File([blob], 'drawing.png', { type: 'image/png' });
      
      const result = await extractTextFromImage(file);
      if (result.success && result.text) {
        onEquationExtracted(result.text);
      }
    } catch (err) {
      console.error('Recognition failed:', err);
    } finally {
      setIsRecognizing(false);
    }
  };

  return (
    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="relative bg-white rounded-2xl border border-gray-700 overflow-hidden shadow-inner">
        <canvas
          ref={canvasRef}
          className="w-full h-[180px] cursor-crosshair touch-none"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
        />
        {!hasDrawn && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-gray-400 text-sm flex items-center gap-2">
              <Pencil size={16} /> Draw your math equation here
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          variant="secondary"
          onClick={clearCanvas}
          className="gap-1.5 text-xs rounded-xl flex-1"
        >
          <RotateCcw size={14} /> Clear
        </Button>
        <Button
          onClick={recognize}
          isLoading={isRecognizing}
          className="gap-1.5 text-xs rounded-xl flex-1"
          disabled={!hasDrawn}
        >
          <Wand2 size={14} /> {isRecognizing ? 'Recognizing...' : 'Recognize'}
        </Button>
      </div>
    </div>
  );
};
