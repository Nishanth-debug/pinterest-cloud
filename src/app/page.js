"use client";
import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [highRes, setHighRes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const processUrl = () => {
    try {
      const u = new URL(url);
      const parts = u.pathname.split('/');
      // Ensure we are grabbing the 'originals' for the sharpest base image
      if (parts.length > 2) parts[1] = 'originals';
      u.pathname = parts.join('/');
      setHighRes(u.toString());
    } catch (e) {
      alert("Please paste a valid Pinterest image address.");
    }
  };

  const handleDownload = (type) => {
    setIsProcessing(true);
    // This calls our backend API and passes the selected type (color, enhance, or vector)
    window.location.href = `/api/download?url=${encodeURIComponent(highRes)}&type=${type}`;
    
    // Reset loading state after a few seconds
    setTimeout(() => setIsProcessing(false), 3000);
  };

  return (
    <div style={{ 
      padding: '60px 20px', 
      textAlign: 'center', 
      fontFamily: '"Inter", sans-serif', 
      backgroundColor: '#000', 
      color: '#fff', 
      minHeight: '100vh' 
    }}>
      <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '10px' }}>KODO <span style={{ color: '#E60023' }}>STUDIO</span></h1>
      <p style={{ opacity: 0.7, marginBottom: '40px' }}>Apparel Asset Downloader & Enhancer</p>
      
      <div style={{ marginBottom: '20px' }}>
        <input 
          style={{ 
            width: '100%', 
            maxWidth: '500px', 
            padding: '18px', 
            borderRadius: '12px', 
            border: 'none', 
            backgroundColor: '#222', 
            color: '#fff',
            fontSize: '16px',
            outline: 'none'
          }}
          placeholder="Paste Pinterest link here..." 
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <br />
        <button 
          onClick={processUrl} 
          style={{ 
            marginTop: '20px', 
            padding: '12px 40px', 
            backgroundColor: '#fff', 
            color: '#000', 
            borderRadius: '30px', 
            border: 'none',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: '0.3s'
          }}
        >
          Verify Design
        </button>
      </div>
      
      {highRes && (
        <div style={{ 
          marginTop: '50px', 
          animation: 'fadeIn 0.5s ease-in'
        }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <img 
              src={highRes} 
              style={{ 
                width: '100%', 
                maxWidth: '400px', 
                borderRadius: '20px', 
                border: '1px solid #444',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
              }} 
              alt="preview" 
            />
          </div>
          <br />

          {/* THE NEW THREE-BUTTON LAYOUT */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '30px', flexWrap: 'wrap' }}>
            
            {/* 1. ORIGINAL COLOR */}
            <button 
              onClick={() => handleDownload('color')}
              disabled={isProcessing}
              style={{ padding: '15px 25px', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Get Original PNG
            </button>

            {/* 2. CUSTOM ENHANCED COLOR */}
            <button 
              onClick={() => handleDownload('enhance')}
              disabled={isProcessing}
              style={{ padding: '15px 25px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)' }}
            >
              Enhance Color (2x Sharp)
            </button>

            {/* 3. VECTOR BUTTON */}
            <button 
              onClick={() => handleDownload('vector')}
              disabled={isProcessing}
              style={{ padding: '15px 25px', backgroundColor: '#E60023', color: 'white', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Get B&W Vector
            </button>

          </div>
          
          <p style={{ marginTop: '20px', fontSize: '12px', opacity: 0.5 }}>
            Select the best format for your DTF apparel prints.
          </p>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}