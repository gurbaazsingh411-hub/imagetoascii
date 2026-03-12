import React, { useState, useCallback } from 'react';
import { Upload, Copy, Download, Image as ImageIcon, Settings2, Sparkles } from 'lucide-react';
import './App.css';
import { AsciiCanvas } from './components/AsciiCanvas';

function App() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [asciiText, setAsciiText] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  
  // Controls
  const [resolution, setResolution] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFile(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageSrc(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCopy = () => {
    if (asciiText) {
      navigator.clipboard.writeText(asciiText);
    }
  };

  const handleDownload = () => {
    if (asciiText) {
      const blob = new Blob([asciiText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ascii-art.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleAsciiGenerated = useCallback((text: string) => {
    setAsciiText(text);
  }, []);

  return (
    <div className="container">
      <header className="app-header">
        <h1 className="app-title">
          <Sparkles className="gradient-text" size={48} />
          <span className="gradient-text">Asciiify</span>
        </h1>
        <p className="app-subtitle">Transform your photos into stunning ASCII art.</p>
      </header>

      <main className="main-content animate-slide-up">
        {/* Sidebar Controls */}
        <aside className="sidebar">
          <div 
            className={`upload-zone ${isDragging ? 'drag-active' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input 
              type="file" 
              className="hidden-input" 
              accept="image/*" 
              onChange={handleFileInput} 
            />
            <Upload className="upload-icon" size={48} />
            <p className="upload-text">
              <span className="upload-accent">Click to upload</span> or drag and drop<br />
              SVG, PNG, JPG or GIF
            </p>
          </div>

          <div className="glass-panel control-panel">
            <div className="control-header" style={{marginBottom: '0.5rem', fontSize: '1.2rem', color: 'var(--text-primary)'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <Settings2 size={20} />
                <span>Settings</span>
              </div>
            </div>
            
            <div className="control-group">
              <div className="control-header">
                <label>Resolution Engine</label>
                <span className="control-value">{resolution}px</span>
              </div>
              <input 
                type="range" 
                min="20" 
                max="250" 
                value={resolution} 
                onChange={(e) => setResolution(Number(e.target.value))} 
              />
            </div>

            <div className="control-group">
              <div className="control-header">
                <label>Contrast Enhancement</label>
                <span className="control-value">{contrast}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="200" 
                value={contrast} 
                onChange={(e) => setContrast(Number(e.target.value))} 
              />
            </div>
            
            <div style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
              <button className="btn btn-primary" onClick={handleCopy} style={{flex: 1}}>
                <Copy size={18} /> Copy
              </button>
              <button className="btn" onClick={handleDownload} style={{flex: 1}}>
                <Download size={18} /> Save
              </button>
            </div>
          </div>
        </aside>

        {/* Action Area */}
        <section className="glass-panel output-area">
          <div className="output-header">
            <h2 className="output-title">
              <ImageIcon size={20} className="gradient-text"/>
              Ascii Output
            </h2>
          </div>
          
          <div className="ascii-container">
            {asciiText ? (
              <pre 
                className="ascii-pre"
                style={{
                  fontSize: `${Math.max(4, Math.min(14, 800 / resolution))}px`
                }}
              >
                {asciiText}
              </pre>
            ) : (
              <div className="empty-state">
                <ImageIcon size={48} />
                <p>Upload an image to see the magic happen</p>
              </div>
            )}
            
            <AsciiCanvas 
              imageSrc={imageSrc} 
              resolution={resolution} 
              contrast={contrast} 
              onAsciiGenerated={handleAsciiGenerated} 
            />
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
