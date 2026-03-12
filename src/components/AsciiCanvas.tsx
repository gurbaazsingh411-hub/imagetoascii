import React, { useEffect, useRef } from 'react';

// Character sets mapping luminance to characters
const DARK_THEME_CHARS = [' ', '.', ',', ':', ';', '+', '*', '?', '%', 'S', '#', '@'];

interface AsciiCanvasProps {
  imageSrc: string | null;
  resolution: number;
  contrast: number;
  aspectCorrection: number;
  isColored: boolean;
  isEmoji: boolean;
  onAsciiGenerated: (ascii: string) => void;
}

export const AsciiCanvas: React.FC<AsciiCanvasProps> = ({
  imageSrc,
  resolution,
  contrast,
  aspectCorrection,
  isColored,
  isEmoji,
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
      const canvasWidth = resolution;
      const canvasHeight = Math.floor(resolution * aspectRatio * aspectCorrection);

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
          
          let char;
          if (isEmoji) {
            const EMOJI_PALETTE = [
              { c: '🔴', r: 255, g: 0, b: 0 },
              { c: '🟠', r: 255, g: 140, b: 0 },
              { c: '🟡', r: 255, g: 255, b: 0 },
              { c: '🟢', r: 0, g: 255, b: 0 },
              { c: '🔵', r: 0, g: 0, b: 255 },
              { c: '🟣', r: 128, g: 0, b: 128 },
              { c: '🟤', r: 139, g: 69, b: 19 },
              { c: '⚫', r: 0, g: 0, b: 0 },
              { c: '⚫', r: 30, g: 30, b: 30 },
              { c: '⚪', r: 255, g: 255, b: 255 },
              { c: '🟨', r: 255, g: 218, b: 185 }, // light skin / peach
              { c: '🟥', r: 178, g: 34, b: 34 }, // firebrick red for darker shading
            ];
            
            let minDist = Infinity;
            let bestEmoji = '⚫';
            for (const item of EMOJI_PALETTE) {
              const diffR = r - item.r;
              const diffG = g - item.g;
              const diffB = b - item.b;
              const dist = diffR * diffR + diffG * diffG + diffB * diffB;
              if (dist < minDist) {
                minDist = dist;
                bestEmoji = item.c;
              }
            }
            char = bestEmoji;
          } else {
            const charIndex = Math.floor((luminance / 255) * (DARK_THEME_CHARS.length - 1));
            char = DARK_THEME_CHARS[charIndex];
          }

          if (isColored && !isEmoji) {
            asciiStr += `<span style="color: rgb(${data[offset]},${data[offset+1]},${data[offset+2]})">${char === ' ' ? '&nbsp;' : char}</span>`;
          } else {
            asciiStr += char;
          }
        }
        asciiStr += '\n';
      }

      onAsciiGenerated(asciiStr);
    };
    img.src = imageSrc;
  }, [imageSrc, resolution, contrast, aspectCorrection, isColored, isEmoji, onAsciiGenerated]);

  return <canvas ref={canvasRef} style={{ display: 'none' }} />;
};
