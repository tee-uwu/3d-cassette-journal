import React, { useRef, useEffect, useState, useCallback } from 'react';
import { PenTool, Edit3, Paintbrush, Highlighter, Eraser, RotateCcw, RotateCw, Trash2 } from 'lucide-react';
import { audioEngine } from '../../services/audioEngine';

export type PaperTool = 'pen' | 'pencil' | 'watercolor' | 'marker' | 'eraser';

interface PaperCanvasProps {
  initialData?: string;
  paperStyle?: 'blank' | 'lined' | 'dots' | 'grid' | 'kraft';
  onSave: (dataUrl: string) => void;
  readOnly?: boolean;
}

const PALETTE = [
  { name: 'Ink Charcoal', hex: '#1C1B19' },
  { name: 'Sepia Umber', hex: '#5A3E26' },
  { name: 'Prussian Indigo', hex: '#2B405A' },
  { name: 'Sage Moss', hex: '#48604B' },
  { name: 'Ochre Gold', hex: '#C8963E' },
  { name: 'Terracotta', hex: '#B24A35' },
  { name: 'Vintage Rose', hex: '#C47A73' },
  { name: 'Paper White', hex: '#FFFFFF' },
];

export const PaperCanvas: React.FC<PaperCanvasProps> = ({
  initialData,
  paperStyle = 'blank',
  onSave,
  readOnly = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeTool, setActiveTool] = useState<PaperTool>('pen');
  const [activeColor, setActiveColor] = useState<string>(PALETTE[0].hex);
  const [strokeWidth, setStrokeWidth] = useState<number>(3);
  const [currentStyle, setCurrentStyle] = useState(paperStyle);

  const isDrawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number; time: number } | null>(null);
  const history = useRef<ImageData[]>([]);
  const historyIndex = useRef(-1);

  // Draw background template pattern
  const drawBackground = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, style: string) => {
    // Fill base tone
    if (style === 'kraft') {
      ctx.fillStyle = '#E6D7C3';
    } else {
      ctx.fillStyle = '#FAF7F2';
    }
    ctx.fillRect(0, 0, width, height);

    if (style === 'lined') {
      ctx.strokeStyle = 'rgba(120, 140, 160, 0.22)';
      ctx.lineWidth = 1;
      const lineHeight = 28;
      for (let y = 35; y < height; y += lineHeight) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      // Red margin line
      ctx.strokeStyle = 'rgba(215, 80, 80, 0.22)';
      ctx.beginPath();
      ctx.moveTo(42, 0);
      ctx.lineTo(42, height);
      ctx.stroke();
    } else if (style === 'dots') {
      ctx.fillStyle = 'rgba(80, 80, 75, 0.2)';
      const step = 20;
      for (let x = step; x < width; x += step) {
        for (let y = step; y < height; y += step) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (style === 'grid') {
      ctx.strokeStyle = 'rgba(100, 110, 120, 0.12)';
      ctx.lineWidth = 1;
      const step = 20;
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }
  }, []);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high-dpi displays
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    drawBackground(ctx, rect.width, rect.height, currentStyle);

    if (initialData) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
        // Save initial state to history
        const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
        history.current = [snapshot];
        historyIndex.current = 0;
      };
      img.src = initialData;
    } else {
      const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
      history.current = [snapshot];
      historyIndex.current = 0;
    }
  }, [drawBackground, currentStyle, initialData]);

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    history.current = history.current.slice(0, historyIndex.current + 1);
    history.current.push(snapshot);
    historyIndex.current = history.current.length - 1;

    onSave(canvas.toDataURL());
  };

  const undo = () => {
    if (historyIndex.current > 0) {
      historyIndex.current--;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.putImageData(history.current[historyIndex.current], 0, 0);
      onSave(canvas.toDataURL());
      audioEngine.playPenClickSound();
    }
  };

  const redo = () => {
    if (historyIndex.current < history.current.length - 1) {
      historyIndex.current++;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.putImageData(history.current[historyIndex.current], 0, 0);
      onSave(canvas.toDataURL());
      audioEngine.playPenClickSound();
    }
  };

  const clearCanvas = () => {
    if (confirm('Clear drawings on this page?')) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const rect = canvas.getBoundingClientRect();
      drawBackground(ctx, rect.width, rect.height, currentStyle);
      saveState();
      audioEngine.playPenClickSound();
    }
  };

  // Drawing event handlers
  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (readOnly) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    isDrawing.current = true;
    lastPoint.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      time: Date.now(),
    };
    canvas.setPointerCapture(e.pointerId);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !lastPoint.current || readOnly) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();

    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    const now = Date.now();

    const dist = Math.hypot(currentX - lastPoint.current.x, currentY - lastPoint.current.y);
    const timeDelta = Math.max(1, now - lastPoint.current.time);
    const velocity = dist / timeDelta;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    switch (activeTool) {
      case 'pen': {
        // FiftyThree Fountain Pen: dynamic velocity line width
        ctx.strokeStyle = activeColor;
        ctx.globalAlpha = 0.92;
        const width = Math.max(1.2, strokeWidth * 2.5 - velocity * 1.5);
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
        break;
      }
      case 'pencil': {
        // Textured graphite sketch stroke
        ctx.strokeStyle = activeColor;
        ctx.globalAlpha = 0.55;
        ctx.lineWidth = strokeWidth * 1.2;
        ctx.beginPath();
        ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
        break;
      }
      case 'watercolor': {
        // Soft translucent watercolor washes
        ctx.strokeStyle = activeColor;
        ctx.globalAlpha = 0.08;
        ctx.lineWidth = strokeWidth * 7.0;
        ctx.beginPath();
        ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
        break;
      }
      case 'marker': {
        // Chisel highlighter stroke
        ctx.strokeStyle = activeColor;
        ctx.globalAlpha = 0.35;
        ctx.lineWidth = strokeWidth * 4.5;
        ctx.beginPath();
        ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
        break;
      }
      case 'eraser': {
        // Eraser cleans back to paper pattern
        ctx.strokeStyle = currentStyle === 'kraft' ? '#E6D7C3' : '#FAF7F2';
        ctx.globalAlpha = 1.0;
        ctx.lineWidth = strokeWidth * 6;
        ctx.beginPath();
        ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
        break;
      }
    }

    ctx.restore();

    lastPoint.current = {
      x: currentX,
      y: currentY,
      time: now,
    };
  };

  const stopDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    lastPoint.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    saveState();
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between overflow-hidden">
      {/* Paper Surface with Shadow & Rounded Corners */}
      <div className="relative w-full h-[400px] md:h-[460px] rounded-2xl overflow-hidden shadow-inner border border-[#E8E4DC] cursor-crosshair">
        <canvas
          ref={canvasRef}
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerCancel={stopDrawing}
          className="w-full h-full touch-none"
        />
      </div>

      {/* Iconic FiftyThree Paper App Floating Tools Tray */}
      {!readOnly && (
        <div className="mt-4 p-2 px-4 rounded-2xl bg-white/90 backdrop-blur-xl border border-[#E6E4DD] shadow-tape-float flex items-center gap-4 z-20 flex-wrap justify-center">
          {/* Tool Switcher */}
          <div className="flex items-center gap-1 bg-[#EFEEE9] p-1 rounded-xl">
            <button
              onClick={() => {
                setActiveTool('pen');
                setStrokeWidth(3);
                audioEngine.playPenClickSound();
              }}
              className={`p-2 rounded-lg transition-all ${
                activeTool === 'pen' ? 'bg-[#242420] text-white shadow-xs' : 'text-[#76746E] hover:text-[#242420]'
              }`}
              title="Fountain Pen"
            >
              <PenTool className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setActiveTool('pencil');
                setStrokeWidth(2.5);
                audioEngine.playPenClickSound();
              }}
              className={`p-2 rounded-lg transition-all ${
                activeTool === 'pencil' ? 'bg-[#242420] text-white shadow-xs' : 'text-[#76746E] hover:text-[#242420]'
              }`}
              title="Graphite Pencil"
            >
              <Edit3 className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setActiveTool('watercolor');
                setStrokeWidth(6);
                audioEngine.playPenClickSound();
              }}
              className={`p-2 rounded-lg transition-all ${
                activeTool === 'watercolor' ? 'bg-[#242420] text-white shadow-xs' : 'text-[#76746E] hover:text-[#242420]'
              }`}
              title="Watercolor Brush"
            >
              <Paintbrush className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setActiveTool('marker');
                setStrokeWidth(5);
                audioEngine.playPenClickSound();
              }}
              className={`p-2 rounded-lg transition-all ${
                activeTool === 'marker' ? 'bg-[#242420] text-white shadow-xs' : 'text-[#76746E] hover:text-[#242420]'
              }`}
              title="Chisel Marker"
            >
              <Highlighter className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setActiveTool('eraser');
                setStrokeWidth(5);
                audioEngine.playPenClickSound();
              }}
              className={`p-2 rounded-lg transition-all ${
                activeTool === 'eraser' ? 'bg-[#242420] text-white shadow-xs' : 'text-[#76746E] hover:text-[#242420]'
              }`}
              title="Eraser"
            >
              <Eraser className="w-4 h-4" />
            </button>
          </div>

          <div className="h-5 w-px bg-[#E6E4DD]" />

          {/* FiftyThree Color Palette */}
          <div className="flex items-center gap-1.5">
            {PALETTE.map((c) => (
              <button
                key={c.hex}
                onClick={() => {
                  setActiveColor(c.hex);
                  audioEngine.playPenClickSound();
                }}
                className={`w-6 h-6 rounded-full transition-transform ${
                  activeColor === c.hex
                    ? 'ring-2 ring-offset-2 ring-[#242420] scale-110'
                    : 'hover:scale-105'
                }`}
                style={{ backgroundColor: c.hex, border: '1px solid rgba(0,0,0,0.1)' }}
                title={c.name}
              />
            ))}
          </div>

          <div className="h-5 w-px bg-[#E6E4DD]" />

          {/* Paper Texture Pattern Switcher */}
          <div className="flex items-center gap-1">
            {(['blank', 'lined', 'dots', 'grid'] as const).map((style) => (
              <button
                key={style}
                onClick={() => {
                  setCurrentStyle(style);
                  audioEngine.playPageFlipSound();
                }}
                className={`px-2 py-1 rounded-lg text-[10px] font-mono capitalize transition-all ${
                  currentStyle === style
                    ? 'bg-[#242420] text-white font-medium'
                    : 'text-[#898780] hover:text-[#242420] bg-[#EFEEE9]'
                }`}
              >
                {style}
              </button>
            ))}
          </div>

          <div className="h-5 w-px bg-[#E6E4DD]" />

          {/* Undo / Redo / Clear */}
          <div className="flex items-center gap-1">
            <button
              onClick={undo}
              className="p-1.5 text-[#898780] hover:text-[#242420] hover:bg-[#EFEEE9] rounded-lg transition-colors"
              title="Undo Stroke"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={redo}
              className="p-1.5 text-[#898780] hover:text-[#242420] hover:bg-[#EFEEE9] rounded-lg transition-colors"
              title="Redo Stroke"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={clearCanvas}
              className="p-1.5 text-[#898780] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Clear Canvas"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
