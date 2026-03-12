import React, { useEffect, useRef } from 'react';

// Character sets mapping luminance to characters
const DARK_THEME_CHARS = [' ', '.', ',', ':', ';', '+', '*', '?', '%', 'S', '#', '@'];

interface AsciiCanvasProps {
  imageSrc: string | null;
  resolution: number;
  contrast: number;
  onAsciiGenerated: (ascii: string) => void;
}

export const AsciiCanvas: React.FC<AsciiCanvasProps> = ({
  imageSrc,
  resolution,
  contrast,
  onAsciiGenerated,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!imageSrc) return;
    
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      const aspectRatio = img.height / img.width;
      // Multiplying by 0.55 compensates for monospace font aspect ratio
      const canvasWidth = resolution;
      const canvasHeight = Math.floor(resolution * aspectRatio * 0.55);

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
      const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
      const data = imageData.data;

      const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
      
      let asciiStr = '';
      for (let y = 0; y < canvasHeight; y++) {
        for (let x = 0; x < canvasWidth; x++) {
          const offset = (y * canvasWidth + x) * 4;
          let r = data[offset];
          let g = data[offset + 1];
          let b = data[offset + 2];

          // Contract applied
          r = Math.max(0, Math.min(255, factor * (r - 128) + 128));
          g = Math.max(0, Math.min(255, factor * (g - 128) + 128));
          b = Math.max(0, Math.min(255, factor * (b - 128) + 128));

          // Calculate standard luminance relative to human eye
          const luminance = (0.299 * r + 0.587 * g + 0.114 * b);
          
          const charIndex = Math.floor((luminance / 255) * (DARK_THEME_CHARS.length - 1));
          asciiStr += DARK_THEME_CHARS[charIndex];
        }
        asciiStr += '\n';
      }

      onAsciiGenerated(asciiStr);
    };
    img.src = imageSrc;
  }, [imageSrc, resolution, contrast, onAsciiGenerated]);

  return <canvas ref={canvasRef} style={{ display: 'none' }} />;
};
